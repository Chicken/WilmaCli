const chalk = require("chalk");
/**
 * Function to standardize color usage FROM MYYRÄMIES
 * @Function
 * @param {String} text Text to colorize
 * @param {String} colorname Color name
 * @returns {String} Text colorized with chalk
 */

let colorize = (text,colorname) => {
  switch (colorname) {
    case "border":
      return(chalk.blue(text));
    case "title":
      return(chalk.cyan(text));
    case "text":
      return(chalk.magentaBright(text));
    case "warning":
      return(chalk.yellow(text));
    case "error":
      return(chalk.redBright(text));
    case "success":
      return(chalk.greenBright(text));
    default:
      return(text);
  }
}
module.exports = colorize;
