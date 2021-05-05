const options = require("./config.json");
const GUI = require("./gui/main.js");
const Login = require("./gui/login.js");
const Main = require("./gui/default.js");
const Client = require("./client.js");
const loginScene = new Login();
const gui = new GUI();
const client = new Client();
const mainScene = new Main();
let currentroom = null;

client.login(options.user, options.pass);
client.once("ready", e => {
	const rooms = e.getRooms();
	currentroom = rooms[0].roomId;
	for(let room of rooms) {
		mainScene.sidebar.room(room.name, room.roomId);
	}
	mainScene.messages.resize();
})

mainScene.input.on("text", (text) => {
	if(!text.getText()) return;
	client.send(currentroom, text.getText());
	text.setText("");
});

client.on("message", async (message, room) => {
	if(room.roomId !== currentroom) return;
	const data = {
		avatar: await client.getPfp(message.sender.userId),
		author: message.sender.name,
		sender: message.sender.userId,
	};
	if(message.event.content.msgtype === "m.image") {
		data.type = "image"
		data.img = await client.fetchImage(message.event.content.url);
	} else {
		data.type = "text";
		data.body = message.event.content.body;
	}
	mainScene.messages.add(data);
});

mainScene.sidebar.on("click", (id) => {
	currentroom = id;
});

function switchChannel(name) {
	// mainScene.messages.clear();
	// for(let i of client.getMessages(name)) {
		// mainScene.messages.add(i);
	// }
	// channel = name;
}

// gui.scene(loginScene);
gui.scene(mainScene);
gui.init();
