const Element = require("./base.js");
const EventEmitter = require("events");
const gui = require("gui");
const handCursor = gui.Cursor.createWithType("hand");
const textCursor = gui.Cursor.createWithType("text");
const { font } = require("../core/vars.js");

class Input extends Element {
	constructor() {
		super();
		
		const text = gui.Entry.create();
		const container = gui.Container.create();
		const add = gui.Button.create("+");
		
		text.setStyle({ flex: 1 });
		text.setFont(font.default);
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

class Messages extends Element {
	constructor() {
		super();
		
		const scroll = gui.Scroll.create();
		const container = gui.Container.create();
		const rewind = gui.Button.create("rewind");
		const messages = gui.Container.create();

		rewind.setEnabled(false);
		rewind.onClick = () => this.emit("rewind");
		container.setStyle({ justifyContent: "flex-end" });
		messages.setStyle({ padding: 16, paddingBottom: 8 });
		container.addChildView(rewind);
		container.addChildView(messages);
		scroll.setStyle({ flex: 1 });
		scroll.setContentView(container);
		
		this.messages = messages;
		this.rewind = rewind;
		this.scroll = scroll;
		this.lastauthor = null;
		this.map = new Map();
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
		this.map.clear();
	}

	append(data) {
		if(this.map.has(data.id)) return;
		const words = this.getContainer(data);
		this.add(data, words);
		this.lastauthor = data.sender;
	}
	
	prepend(data) {
		if(this.map.has(data.id)) return;
		const words = this.getContainer(data, true);
		this.add(data, words);
	}

	add(data, container) {
		if(data.type === "text") {
			const body = gui.Label.create(data.body);
			body.setAlign("start");
			body.setVAlign("start");
			body.setFont(font.default);
			// body.setCursor(textCursor);
			body.setFocusable(true);
			container.addChildView(body);
			this.map.set(data.id, body);
		} else {
			const img = gui.GifPlayer.create();
			img.setStyle({ maxWidth: "100%", minWidth: 32, minHeight: 32, alignSelf: "flex-start" });
			img.setImage(data.img);
			img.setCursor(handCursor);
			img.onMouseDown = data.download;
			img.setFocusable(true);
			this.map.set(data.id, img);
			container.addChildView(img);
		}
	}

	getContainer(data, prepend = false) {
		if(!prepend && this.lastauthor === data.sender) {
			const last = this.messages.childAt(this.messages.childCount() - 1);
			return last.childAt(1);
		}
		
		const container = gui.Container.create();
		const words = gui.Container.create();
		const pfp = gui.GifPlayer.create();
		const author = gui.Label.create(data.author);

		container.setStyle({ flexDirection: "row", marginBottom: 8 });
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
		if(prepend) {
			this.messages.addChildViewAt(container, 0);
		} else {
			this.messages.addChildView(container);
		}
		return words;
	}

	resize() {
		// waiting for https://github.com/yue/yue/issues/119
		// const { height }= this.messages.getPreferredSize();
		// this.scroll.setContentSize({ height });
		this.scroll.setContentSize({ height: 10000 });
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
		const button = gui.Container.create();
		const label = gui.Label.create(name);
		const bg = color => () => button.setBackgroundColor(color);
		label.setStyle({ marginRight: 4, marginLeft: 4 });
		label.setAlign("start");
		label.setFont(font.button);
		label.setCursor(handCursor);
		button.setStyle({ width: "100%", padding: 4 });
		button.setCursor(handCursor);
		button.setFocusable(true);
		label.onMouseEnter = bg("#222222");
		label.onMouseLeave = bg("#222222");
		button.onMouseEnter = bg("#222222");
		button.onMouseLeave = bg("#333333");
		button.onMouseDown = () => this.emit("click", id);
		button.addChildView(label);
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
