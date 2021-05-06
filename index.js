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
	chat.messages.rewind.setEnabled(true);
});

chat.input.on("text", (text) => {
	if(!text.getText()) return;
	client.send(currentroom.roomId, text.getText());
	text.setText("");
});

chat.messages.on("rewind", async () => {
	const { rewind } = chat.messages;
	const amount = 30;
	rewind.setEnabled(false);
	rewind.setTitle("rewinding");
	await client.rewind(currentroom, amount);
	rewind.setTitle("rewind");
	rewind.setEnabled(true);
});

client.on("message", handleMessage);
chat.sidebar.on("click", switchRoom);

async function handleMessage(message, room, toBeginning) {
	if(room.roomId !== currentroom?.roomId) return;
	if (message.getType() !== "m.room.message") return;
	if(!message.event.content.body) return;
	const data = {
		avatar: await client.getPfp(message.sender.userId),
		author: message.sender.name,
		sender: message.sender.userId,
		id: message.event.event_id,
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
	
	if(toBeginning) {
		chat.messages.prepend(data);
	} else {
		chat.messages.append(data);
	}
}

async function switchRoom(id) {
	currentroom = client.client.getRoom(id);
	window.title(`${currentroom.name} - matrix`);
	chat.messages.clear();
	for(let i of currentroom.timeline) {
		await handleMessage(i, currentroom);
	}
	chat.messages.resize();
}

window.scene(chat);
window.init();
