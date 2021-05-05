const options = require("./config.json");
const fs = require("fs");
const tmp = require("os").tmpdir();
const path = require("path");
const open = require("open");
const gui = new (require("./gui/main.js"));
// const loginScene = new (require("./gui/login.js"));
const mainScene = new (require("./gui/scenes/chat.js"));
const client = new (require("./core/client.js"));
let currentroom = null;
gui.title("loading");

client.login(options.user, options.pass);
client.once("ready", e => {
	const rooms = e.getRooms().sort((a, b) => a.name > b.name ? 1 : -1);
	for(let room of rooms) {
		mainScene.sidebar.button(room.name, room.roomId);
	}
	switchRoom(rooms[0].roomId);
});

mainScene.input.on("text", (text) => {
	if(!text.getText()) return;
	client.send(currentroom.roomId, text.getText());
	text.setText("");
});

client.on("message", handleMessage);
mainScene.sidebar.on("click", switchRoom);

async function handleMessage(message, room) {
	if(room.roomId !== currentroom?.roomId) return;
	if (message.getType() !== "m.room.message") return;
	const data = {
		avatar: await client.getPfp(message.sender.userId),
		author: message.sender.name,
		sender: message.sender.userId,
	};
	if(message.event.content.msgtype === "m.image") {
		data.type = "image"
		data.img = await client.fetch(message.event.content.url);
		data.download = () => {
			const where = path.join(tmp, message.event.content.body);
			fs.writeFileSync(where, data.img);
			open(where);
		};
	} else {
		data.type = "text";
		data.body = message.event.content.body;
	}
	mainScene.messages.add(data);
}

async function switchRoom(id) {
	currentroom = client.client.getRoom(id);
	gui.title(`${currentroom.name} - matrix`);
	mainScene.messages.clear();
	for(let i of currentroom.timeline) {
		await handleMessage(i, currentroom);
	}
	mainScene.messages.resize();
}

// gui.scene(loginScene);
gui.scene(mainScene);
gui.init();
