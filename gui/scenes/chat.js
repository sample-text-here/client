const gui = require("gui");
const { font } = require("../../core/vars.js");
const { Input, Messages } = require("../parts.js");

class Typing {
	constructor() {
		const container = gui.Container.create();
		const display = gui.Label.create("");

		display.setAlign("start");
		display.setFont(font.small);
		container.setStyle({
			paddingTop: 2,
			paddingBottom: 3,
			paddingLeft: 4,
			paddingRight: 4,
		});
		container.setBackgroundColor("#222222");
		container.addChildView(display);
		
		this.users = new Map();
		this.display = display;
		this.container = container;
		this.text = "";

		let dots = 0;
		setInterval(() => {
			if(!this.text) {
				this.display.setText("");
				return;
			}
			this.display.setText(this.text + ".".repeat(dots));
			dots = (dots + 1) % 4;
		}, 200);
	}

	reset() {
		this.users.clear();
		this.display.setText("");
	}

	update(member) {
		if(member.typing) {
			this.users.set(member.userId, member.rawDisplayName);
		} else {
			this.users.delete(member.userId);
		}

		if(this.users.size === 1) {
			this.text = `${member.rawDisplayName} is typing`;
		} else if(this.users.size) {
			let out = " ";
			for(let i of this.users) out += i[1] + ", ";
			this.text = `${out.slice(0, -2)} are typing`;
		} else {
			this.text = "";
		}
	}

	build(parent) {
		parent.addChildView(this.container);
	}
}

class Chat {
	constructor() {
		const input = new Input();
		const messages = new Messages();
		const typing = new Typing();
		
		this.messages = messages;
		this.typing = typing;
		this.input = input;
	}

	build(parent) {
		this.messages.build(parent);
		this.typing.build(parent);
		this.input.build(parent);
	}
}

module.exports = Chat;
