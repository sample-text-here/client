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
		window.sidebar.button(room.name, room.roomId);
	}
	switchRoom(rooms[0].roomId);
	chat.messages.rewind.setEnabled(true);
});

client.client.on("RoomMember.typing", (event, member) => {
	if(member.roomId !== currentroom?.roomId) return;
	if(client.client.isUserIgnored(member.userId)) return;
 	chat.typing.update(member);
});

chat.input.on("text", (text) => {
	if(!text.getText()) return;
	client.send(currentroom.roomId, text.getText());
	text.setText("");
});

chat.messages.on("rewind", async () => {
	const { rewind } = chat.messages;
	const amount = 50;
	rewind.setEnabled(false);
	rewind.setTitle("rewinding");
	const rewound = await client.rewind(currentroom, amount);
	for(let i of rewound.chunk) {
		if (i.type !== "m.room.message") return;
		if(!i.content.body) return;
		const user = client.client.getUser(i.user_id);
		chat.messages.prepend(await getData(i, user, currentroom));
	}
	rewind.setTitle("rewind");
	rewind.setEnabled(true);
});

client.on("message", handleMessage);
window.sidebar.on("click", switchRoom);

async function handleMessage(message, room, toBeginning) {
	if(room.roomId !== currentroom?.roomId) return;
	if(message.getType() !== "m.room.message") return;
	if(!message.event.content.body) return;
	if(toBeginning) return;
	const data = await getData(message.event, message.sender, room);
	chat.messages.append(data);
}

async function getData(message, sender, room) {
	const data = {
		avatar: await client.getPfp(sender.userId),
		author: sender.rawDisplayName,
		sender: sender.userId,
		id: message.event_id,
	};
	if(message.content.msgtype === "m.image") {
		const { url, info } = message.content;
		data.type = "image";
		data.img = gui.Image.createFromBuffer(await client.fetch(url, 64, 64), 1);
		data.download = async () => {
			const where = path.join(tmp, message.content.body);
			fs.writeFileSync(where, await client.fetch(url, info.w, info.h, true));
			open(where);
		};
	} else {
		data.type = "text";
		data.body = message.content.body;
	}
	return data;
}

async function switchRoom(id) {
	currentroom = client.client.getRoom(id);
	window.title(`${currentroom.name} - matrix`);
	chat.messages.clear();
	chat.typing.reset();
	for(let i of currentroom.timeline) {
		await handleMessage(i, currentroom);
	}
	chat.messages.resize();
}

window.scene(chat);
window.init();
