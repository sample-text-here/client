const gui = require("gui");

class GUI {
	constructor() {
		const window = gui.Window.create({});
		
		window.setTitle("hello");
		window.setContentSize({ width: 600, height: 400 });
		window.center();
		
		this.window = window;
	}

	init() {
		this.window.onClose = () => gui.MessageLoop.quit();
		this.window.activate();
		if(!process.versions.yode) {
			gui.MessageLoop.run();
			process.exit(0);
		}

		global.window = this.window;
	}
	
	title(name) { this.window.setTitle(name) }
	scene(scene) { this.window.setContentView(scene.main) }
}

module.exports = GUI;
