const gui = require("gui");
const { Sidebar, Input, Messages } = require("../parts.js");

class Main {
	constructor() {
		const main = gui.Container.create();
		const content = gui.Container.create();
		const sidebar = new Sidebar();
		const input = new Input();
		const messages = new Messages();
		
		main.setStyle({ flexDirection: "row" });
		content.setBackgroundColor("#2e2e2e");
		content.setStyle({ flex: 4 });
		messages.build(content);
		input.build(content);
		sidebar.build(main);
		main.addChildView(content);
		
		this.sidebar = sidebar;
		this.messages = messages;
		this.input = input;
		this.main = main;
	}
}

module.exports = Main;
