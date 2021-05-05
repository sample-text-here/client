const EventEmitter = require("events");
const gui = require("gui");
const { font } = require("./parts.js");

function label(text) {
	const label = gui.Label.create(text);
	label.setFont(font.title);
	label.setAlign("start");
	return label;
}

function addLabel(entry, text) {
	const container = gui.Container.create();
	container.setStyle({
		flexDirection: "row",
		justifyContent: "space-between",
	});
	container.addChildView(label(text));
	container.addChildView(entry);
	return container;
}

class Login extends EventEmitter {
	constructor() {
		super();
		
		const main = gui.Container.create();
		this.username = null;
		this.password = null;
		this.main = main;
		this.generate();
	}

	generate() {
		const container = gui.Container.create();
		container.setStyle({
			minWidth: 100,
			maxWidth: 500,
			width: "50%",
		});
		this.main.setStyle({
			justifyContent: "center",
			alignItems: "center",
		});

		const username = gui.Entry.createType("normal");
		const password = gui.Entry.createType("password");
		const button = gui.Button.create("Log in");
		const error = gui.Label.create("");

		error.setColor("#ed0808");
		error.setFont(font.title);
		error.setAlign("start");
		error.setVisible(false);
		button.setStyle({ marginTop: 16 });

		username.onActivate = () => this.submit();
		password.onActivate = () => this.submit();
		button.onClick = () => this.submit();

		container.addChildView(addLabel(username, "username"));
		container.addChildView(addLabel(password, "password"));
		container.addChildView(error);
		container.addChildView(button);
		
		this.errorLabel = error;
		this.username = username;
		this.password = password;
		this.main.addChildView(container);
	}

	error(why) {
		this.errorLabel.setText(why);
		this.errorLabel.setVisible(true);
	}

	submit() {
		const username = this.username.getText();
		const password = this.password.getText();
		if(!username) return this.error("missing username");
		if(!password) return this.error("missing password");
		this.errorLabel.setVisible(false);
		this.emit("submit", { username, password });
	}
}

module.exports = Login;
