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
	for(let room of rooms) {
		mainScene.sidebar.room(room.name, room.roomId);
	}
	mainScene.messages.resize();
})

mainScene.input.on("text", (text) => {
	if(!text.getText()) return;
	// client.send({
		// channel,
		// content: text.getText(),
		// author: "anon",
	// });
	text.setText("");
});

client.on("message", async (message) => {
	mainScene.messages.add({
		body: message.event.content.body,
		avatar: await client.getPfp(message.sender.userId),
		author: message.sender.name,
		sender: message.sender.userId,
	});
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
