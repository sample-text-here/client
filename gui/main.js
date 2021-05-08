const gui = require("gui");
const { Sidebar } = require("./parts.js");
global.windows = [];

class GUI {
	constructor() {
		const window = gui.Window.create({});
		const container = gui.Container.create();
		const content = gui.Container.create();
		const sidebar = new Sidebar();
		
		container.setStyle({ flexDirection: "row" });
		content.setBackgroundColor("#2e2e2e");
		content.setStyle({ flex: 4 });
		sidebar.build(container);
		container.addChildView(content);
		
		window.setTitle("hello");
		window.setContentView(container);
		window.setContentSize({ width: 600, height: 400 });
		window.center();
		
		this.sidebar = sidebar;
		this.container = container;
		this.content = content;
		this.window = window;
	}

	init() {
		this.window.onClose = () => process.exit(0);
		this.window.activate();
		global.windows.push(this.window);
	}
	
	scene(scene) {
		const { content } = this;
		while(content.childCount()) content.removeChild(content.childAt(0));
		scene.build(content);
	}

	title(name) { this.window.setTitle(name) }
}

module.exports = GUI;
