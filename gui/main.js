const gui = require("gui");
global.windows = [];

class GUI {
	constructor() {
		const window = gui.Window.create({});
		
		window.setTitle("hello");
		window.setContentSize({ width: 600, height: 400 });
		window.center();
		
		this.window = window;
	}

	init() {
		this.window.onClose = () => process.exit(0);
		this.window.activate();
		global.windows.push(this.window);
	}
	
	title(name) { this.window.setTitle(name) }
	scene(scene) { this.window.setContentView(scene.main) }
}

module.exports = GUI;
