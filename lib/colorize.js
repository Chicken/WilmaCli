const chalk = require("chalk");
const basedir = require("os").homedir() + "/.wilma/";
const fs = require("fs");
let colors;

if(fs.existsSync(basedir) && fs.existsSync(basedir + "theme.json")) {
    colors = require(basedir + "theme.json");
} else {
    colors = {
        border: "blue",
        title: "cyan",
        text: "magentaBright",
        warning: "yellow",
        error: "redBright",
        success: "greenBright"
    };
}

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