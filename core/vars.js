require('json5/lib/register');

const gui = require("gui");
const config = require("../config.json5");

function parseFont() {
	const baseFont = getBaseFont();
	const font = {
		default: baseFont,
		bold: getFont("bold", "bold", "normal"),
		small: getFont("small", "normal", "normal", -2),
		title: getFont("title", "normal", "normal", 2),
		button: getFont("button", "normal", "normal", 2),
		titleBold: getFont("button", "bold", "normal", 2),
		selected: getFont("button", "bold", "normal", 2),
	};
	return font;
	
	function getBaseFont() {
		if(config.font["default"]) {
			return gui.Font.createFromPath(config.font["default"], 14);
		}
		gui.Font.default();
	}

	function getFont(name, weight, style, scale = 1) {
		if(config.font[name]) {
			return gui.Font.createFromPath(config.font[name], 14 * scale);
		}
		return baseFont.derive(scale, weight, style);
	}
}

module.exports = {
	font: parseFont(),
};
