const fs = require("fs");
const tmp = require("os").tmpdir();
const home = require("os").homedir();
const path = require("path");
const open = require("open");

class Files {
	constructor() {
		this.cache = new Map();
	}
	
	download(url) {
		if(this.cache.has(url)) return this.cache.get(url);
		const direct = this.client.mxcUrlToHttp(url, 64, 64, "scale", true);
		return new Promise((res, rej) => {
			https.get(direct, (got) => {
				const parts = [];
				got.on("data", d => parts.push(d));
				got.on("end", () => {
					const buf = Buffer.concat(parts);
					this.cache.set(url, buf);
					res(buf);
				});
			}).on("error", rej).end();
		});
	}
	
	open(where) {
		open(where);
	}
}

module.exports = new Files;
