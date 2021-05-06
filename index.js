const options = require("./config.json");
const fs = require("fs");
const tmp = require("os").tmpdir();
const path = require("path");
const open = require("open");
const gui = require("gui");
const window = new (require("./gui/main.js"));
const chat = new (require("./gui/scenes/chat.js"));
const client = new (require("./core/client.js"));
let currentroom = null;
window.title("loading");

client.login(options.user, options.pass);
client.once("ready", e => {
	const rooms = e.getRooms().sort((a, b) => a.name > b.name ? 1 : -1);
	for(let room of rooms) {
		chat.sidebar.button(room.name, room.roomId);
	}
	switchRoom(rooms[0].roomId);
});

chat.input.on("text", (text) => {
	if(!text.getText()) return;
	client.send(currentroom.roomId, text.getText());
	text.setText("");
});

client.on("message", handleMessage);
chat.sidebar.on("click", switchRoom);

async function handleMessage(message, room) {
	if(room.roomId !== currentroom?.roomId) return;
	if (message.getType() !== "m.room.message") return;
	if(!message.event.content.body) return;
	const data = {
		avatar: await client.getPfp(message.sender.userId),
		author: message.sender.name,
		sender: message.sender.userId,
	};
	if(message.event.content.msgtype === "m.image") {
		const { url, info } = message.event.content;
		data.type = "image";
		data.img = gui.Image.createFromBuffer(await client.fetch(url, 64, 64), 1);
		data.download = async () => {
			const where = path.join(tmp, message.event.content.body);
			fs.writeFileSync(where, await client.fetch(url, info.w, info.h));
			open(where);
		};
	} else {
		data.type = "text";
		data.body = message.event.content.body;
	}
	chat.messages.add(data);
}

async function switchRoom(id) {
	currentroom = client.client.getRoom(id);
	window.title(`${currentroom.name} - matrix`);
	chat.messages.clear();
	const len = currentroom.timeline.length;
	for(let i = len - 30; i < len; i++) {
		if(i < 0) continue;
		await handleMessage(currentroom.timeline[i], currentroom);
	}
	chat.messages.resize();
}

window.scene(chat);
window.init();






