const readline = require('readline');
const commands = require("./commands");
const colorize = require("./colorize");

/**
 * Function that starts interactive "wilma shell"
 * @Function
 * @param {String} token wilma token
 * @param {Function}} get function to fetch data from wilma 
 */
module.exports = (token, get) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    process.stdout.write("> ");
    rl.on("line", async input => {
        try{
            let [cmd, arg] = input.split(" ");
            if(cmd=="exit") {
                process.exit(0);
            }
            if(Object.keys(commands).includes(cmd)) {
                await commands[cmd](token, get, arg, true);
            } else {
                console.log(colorize("Invalid command. Use the help command", "error"));
            }
            process.stdout.write("> ");
        } catch(e) {
            console.error(e);
        }
    })
}
