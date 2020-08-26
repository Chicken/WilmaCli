const chalk = require("chalk");
const colors = require("../theme.json");
/**
 * Function to standardize color usage FROM MYYRÄMIES
 * @Function
 * @param {String} text Text to colorize
 * @param {String} colorname Color name
 * @param {String} textclass Text classifications
 * @returns {String} Text colorized with chalk
 */

let colorize = (text,colorname,textclass) => {
	if(!Object.keys(colors).includes(colorname)) return text;
	if(!Object.keys(colors).includes(textclass)) return chalk[colors[colorname]](text);
	return chalk[colors[textclass]](text);
}
module.exports = colorize;
