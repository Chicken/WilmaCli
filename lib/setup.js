const inquirer = require("inquirer");
const getToken = require("./token");
const colorize = require("./colorize");
const basedir = require("os").homedir() + "/.wilma/";
const fs = require("fs");

const setup = async () => {
    let answers = await inquirer.prompt([
        {
            type: "input",
            name: "url",
            message: "Your wilma root url"
        },
        {
            type: "input",
            name: "user",
            message: "Your wilma username"
        },
        {
            type: "input",
            name: "pass",
            message: "Your wilma password"
        },
        {
            type: "input",
            name: "slug",
            message: "Your wilma slug. This is a number that is appended to end of url when logging in.\n" +
                     "Only exists for accounts with multiple possible roles. Leave empty if non existant.\n" +
                     "This can be for example: !0283743"
        }
    ])

    try {
        await getToken(answers.user, answers.pass, answers.url);
    } catch(e) {
        console.error(colorize("Invalid user, password or wilma url.","error"));
        return;
    }

    if(!fs.existsSync(basedir)) {
        fs.mkdirSync(basedir);
    }

    fs.writeFileSync(basedir + "creds.json", JSON.stringify({
        user: answers.user,
        pass: answers.pass,
        wilma: answers.url,
        slug: answers.slug
    }))

    fs.writeFileSync(basedir + "theme.json", JSON.stringify({
        border: "blue",
        title: "cyan",
        text: "magentaBright",
        warning: "yellow",
        error: "redBright",
        success: "greenBright"
    }))

    console.log(colorize("Succesfully logged in and saved credentials!", "success"));
    return;
}

module.exports = setup;