const Element = require("./base.js");
const EventEmitter = require("events");
const gui = require("gui");
const handCursor = gui.Cursor.createWithType("hand");
const textCursor = gui.Cursor.createWithType("text");
const getFont = (...args) => gui.Font.default().derive(...args);
const font = {
	bold: getFont(1, "bold", "normal"),
	button: getFont(1.5, "normal", "normal"),
	title: getFont(1.5, "normal", "normal"),
	titleBold: getFont(1.5, "bold", "normal"),
	selected: getFont(1.5, "bold", "normal"),
};

class Input extends Element {
	constructor() {
		super();
		
		const text = gui.Entry.create();
		const container = gui.Container.create();
		const add = gui.Button.create("+");
		
		text.setStyle({ flex: 1 });
		text.onActivate = (self) => this.emit("text", self);
		add.onClick = (self) => this.emit("attatch", self);

		text.onKeyDown = (self, e) => {
			if(e.modifiers !== gui.Event.maskControl) return;
			if(e.key !== 'v') return;
			const img = gui.Clipboard.get().getData("image");
			if(img.type !== "image") return;
			console.log(img.value);
			return true;
		};
		
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
		const scroll = gui.Scroll.create();
		const container = gui.Container.create();
		const messages = gui.Container.create();
		const more = gui.Button.create("load more");

		more.onClick = () => this.resize();
		more.setStyle({ marginBottom: 16 });
		more.setVisible(false);
		container.setStyle({ padding: 16, justifyContent: "flex-end" });
		container.addChildView(more);
		container.addChildView(messages);
		scroll.setStyle({ flex: 1 });
		scroll.setContentView(container);
		
		this.messages = messages;
		this.container = container;
		this.scroll = scroll;
		this.more = more;
		this.lastauthor = null;
	}

	build(parent) {
		parent.addChildView(this.scroll);
	}

	clear() {
		const { messages } = this;
		while(messages.childCount()) {
			messages.removeChildView(messages.childAt(0));
		}
		this.lastauthor = null;
	}

	add(data) {
		const words = this.getContainer(data);
		if(data.type === "text") {
			const body = gui.Label.create(data.body);
			body.setAlign("start");
			body.setVAlign("start");
			body.setCursor(textCursor);
			words.addChildView(body);
		} else {
			const img = gui.GifPlayer.create();
			img.setStyle({ maxWidth: "100%", minWidth: 32, minHeight: 32 });
			img.setImage(gui.Image.createFromBuffer(data.img, 1));
			img.setCursor(handCursor);
			img.onMouseDown = data.download;
			words.addChildView(img);
		}
		this.lastauthor = data.sender;
	}

	getContainer(data) {
		if(this.lastauthor === data.sender) {
			const last = this.messages.childAt(this.messages.childCount() - 1);
			return last.childAt(1);
		}
		
		const container = gui.Container.create();
		const words = gui.Container.create();
		const pfp = gui.GifPlayer.create();
		const author = gui.Label.create(data.author);

		container.setStyle({ flexDirection: "row", marginBottom: 4 });
		pfp.setStyle({ width: 32, height: 32, marginRight: 8 });
		pfp.setScale("down");
		pfp.setImage(data.avatar);
		author.setFont(font.bold);
		author.setAlign("start");
		author.setVAlign("start");
		author.setCursor(textCursor);

		words.addChildView(author);
		container.addChildView(pfp);
		container.addChildView(words);
		this.messages.addChildView(container);
		return words;
	}

	resize() {
		// waiting for https://github.com/yue/yue/issues/119
		// const { height }= this.container.getPreferredSize();
		// this.scroll.setContentSize({ height });
		this.scroll.setContentSize({ height: 1000 });
	}
}

// sidebar with clickable items
class Sidebar extends Element {
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

	button(name, id) {
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
