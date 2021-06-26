#!/usr/bin/env node

const getToken = require("./lib/token");
const setup = require("./lib/setup");
const commands = require("./lib/commands");
const interactive = require("./lib/interactive");
const basedir = require("os").homedir() + "/.wilma/";
const fs = require("fs");
const colorize = require("./lib/colorize");
const bent = require("bent");

const command = process.argv[2];

(async()=>{ 
    if((!fs.existsSync(basedir) || !fs.existsSync(basedir + "creds.json"))) {
        console.log(colorize("Not logged in.", "warning"));
        setup();
        return;
    }

    const {
        user,
        pass,
        wilma,
        slug
    } = require(basedir + "creds.json");

    let token;

    try {
        token = await getToken(user, pass, wilma);
    } catch(e) {
        console.error(colorize("Failed to login.","error"));
        process.exit(1);
    }

    let get = bent("GET", 200, `${wilma}${slug?`/${slug}`:''}/`, "json", {
        "Cookie": `Wilma2SID=${token};`
    });

    console.log(colorize("Successfully logged in.", "success"));

    if(command) {
        if(Object.keys(commands).includes(command)) {
            commands[command](token, get, process.argv[3]);
        } else {
            console.log(colorize("Invalid command. Use the help command", "error"));
        }
    } else {
        interactive(token, get)
    }
})();
