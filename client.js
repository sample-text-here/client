const EventEmitter = require("events");
const matrix = require("matrix-js-sdk");

class Client extends EventEmitter {
	constructor() {
		super();
		const client = matrix.createClient("https://matrix.org");
		client.on("Room.timeline", (event) => {
			if (event.getType() !== "m.room.message") return;
			this.emit("message", event);
		});
		client.once('sync', (state) => {
			if(state === 'PREPARED') {
				this.emit("ready", client);
			} else {
				console.error(state);
				process.exit(1);
			}
		});
		this.client = client;
	}

	async login(user, password) {
		await this.client.login("m.login.password", { user, password });
		this.client.startClient();
	}
}

module.exports = Client;
