const EventEmitter = require("events");
const gui = require("gui");
const handCursor = gui.Cursor.createWithType("hand");
const getFont = (...args) => gui.Font.default().derive(...args);
const font = {
	bold: getFont(1, "bold", "normal"),
	button: getFont(1.5, "normal", "normal"),
	title: getFont(1.5, "normal", "normal"),
	titleBold: getFont(1.5, "bold", "normal"),
	selected: getFont(1.5, "bold", "normal"),
};

class Input extends EventEmitter {
	constructor() {
		super();
		
		const text = gui.Entry.create();
		const container = gui.Container.create();
		const add = gui.Button.create("+");
		
		text.setStyle({ flex: 1 });
		text.onActivate = (self) => this.emit("text", self);
		add.onClick = (self) => this.emit("attatch", self);
		
		container.setStyle({ width: "100%", flexDirection: "row" });
		container.addChildView(text);
		container.addChildView(add);
		
		this.text = text;
		this.container = container;
	}

	build(parent) {
		parent.addChildView(this.container);
	}
}

class DragAndDrop {
	constructor() {
		const dialog = gui.Container.create();
		dialog.setStyle({
			width: "100%",
			height: "100%",
			x: 0,
			y: 0,
			position: "fixed",
		});
		dialog.setBackgroundColor("#ff0000");
		dialog.setVisible(false);
		
		this.dialog = dialog;
	}

	build(parent) {
		parent.addChildView(this.dialog);
	}
}

class Messages {
	constructor() {
		const messages = gui.Container.create();
		const container = gui.Scroll.create();
		messages.setStyle({
			paddingLeft: 16,
			paddingRight: 16,
			paddingBottom: 8,
			justifyContent: "flex-end",
		});
		
		container.setStyle({ flex: 1 });
		container.setContentView(messages);
		this.messages = messages;
		this.container = container;
		this.lastauthor = null;
	}

	build(parent) {
		parent.addChildView(this.container);
	}

	clear() {
		const { messages } = this;
		while(messages.childCount()) {
			messages.removeChildView(messages.childAt(0));
		}
	}

	add(data) {
		const body = gui.Label.create(data.event.content.body);
		body.setAlign("start");
		body.setVAlign("start");
		body.setStyle({ width: "100%" });
		if(this.lastauthor !== data.event.sender) {
			const container = gui.Container.create();
			// const words = gui.Container.create();
			const author = gui.Label.create(data.sender.name);
			// container.setStyle({ flexDirection: "row", marginBottom: 4 });
			container.setStyle({ marginBottom: 4 });
			author.setFont(font.bold);
			author.setAlign("start");
			author.setVAlign("start");
			container.addChildView(author);
			container.addChildView(body);
			// container.addChildView(words);
			// words.addChildView(body);
			this.messages.addChildView(container);	
		} else {
			const last = this.messages.childAt(this.messages.childCount() - 1);
			// const words = last.childAt(1);
			last.addChildView(body);
		}
		this.lastauthor = data.event.sender;
	}

	resize() {
		this.container.setContentSize({
			height: this.messages.getPreferredSize().height,
		});
	}
}

class Sidebar extends EventEmitter {
	constructor() {
		super();
		
		const sidebar = gui.Container.create();
		sidebar.setBackgroundColor("#333333");
		sidebar.setStyle({
			minWidth: 80,
			maxWidth: 240,
			flex: 1,
			alignItems: "flex-start",
		});
		this.sidebar = sidebar;
	}

	clear() {
		const { messages } = this;
		for(let i = 0; i < messages.childCount(); i++) {
			messages.removeChildView(messages.childAt(0));
		}
	}

	room(name, id) {
		const button = gui.Label.create("  " + name);
		const bg = color => () => button.setBackgroundColor(color);
		button.setCursor(handCursor);
		button.setFont(font.button);
		button.setStyle({ width: "100%", padding: 4 });
		button.setAlign("start");
		button.onMouseEnter = bg("#222222");
		button.onMouseLeave = bg("#333333");
		button.onMouseDown = () => this.emit("click", id);
		this.sidebar.addChildView(button);
	}

	section(name) {
		const top = gui.Container.create();
		const content = gui.Container.create();
		top.setStyle({ flexDirection: "row" });
		top.addChildView(gui.Label.create(name));
		top.addChildView(content);
		this.sidebar.addChildView(top);
	}

	build(parent) {
		parent.addChildView(this.sidebar);
	}
}

module.exports = { handCursor, font, Input, DragAndDrop, Messages, Sidebar };
