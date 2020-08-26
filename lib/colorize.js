const chalk = require("chalk");
const colors = require("../theme.json");

/**
 * Function to standardize color usage
 * @Function
 * @param {String} text Text to colorize
 * @param {String} colorname Color name
 * @returns {String} Text colorized with chalk
 */
const colorize = (text,colorname) => {
    if(!Object.keys(colors).includes(colorname)) return text;
    return chalk[colors[colorname]](text);
}

module.exports = colorize;