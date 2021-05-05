const EventEmitter = require("events");
const gui = require("gui");
const matrix = require("matrix-js-sdk");
const https = require("https");

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
		this.pfpcache = new Map();
	}

	async login(user, password) {
		await this.client.login("m.login.password", { user, password });
		this.client.startClient();
	}

	async getPfp(id) {
		if(this.pfpcache.has(id)) return this.pfpcache.get(id);
		const url = (await this.client.getProfileInfo(id)).avatar_url;
		const direct = this.client.mxcUrlToHttp(url, 64, 64, "scale", true);
		return new Promise((res, rej) => {
			https.get(direct, (got) => {
				const parts = [];
				got.on("data", d => parts.push(d));
				got.on("end", () => {
					const img = gui.Image.createFromBuffer(Buffer.concat(parts), 1);
					this.pfpcache.set(id, img);
					res(img);
				});
			}).on("error", rej).end();
		});
	}
}

module.exports = Client;
