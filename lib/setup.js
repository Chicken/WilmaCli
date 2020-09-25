const inquirer = require("inquirer");
const getToken = require("./token");
const colorize = require("./colorize");
const getSlugs = require("./slugs"); 
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
            type: "password",
            name: "pass",
            message: "Your wilma password"
        }
    ])

    if(answers.url[answers.url.length-1] == "/") {
        answers.url = answers.url.substring(0, answers.url.length-1);
    }
    answers.url = answers.url.replace("http://", "https://");
    if(!answers.url.startsWith("https://")) {
        answers.url = "https://" + answers.url;
    }

    let token;

    try {
        token = await getToken(answers.user, answers.pass, answers.url);
    } catch(e) {
        console.error(colorize("Invalid user, password or wilma url.","error"));
        return;
    }

    let slug = "",
        slugs = await getSlugs(answers.url, token);
        
    if(slugs.length > 1) {
        slug = await inquirer.prompt({
                type: "list",
                name: "slug",
                message: "You have multiple users on your wilma account, which one to use?",
                choices: slugs.map(s=>`${s.slug} | ${s.name} - ${s.school}`)
            })
        slug = "!" + slug.slug;
    } else if (slugs.length == 1){
        slug = "!" + slugs[0].slug;
    }

    if(!fs.existsSync(basedir)) {
        fs.mkdirSync(basedir);
    }

    fs.writeFileSync(basedir + "creds.json", JSON.stringify({
        user: answers.user,
        pass: answers.pass,
        wilma: answers.url,
        slug: slug.match(/!\d+/) ? slug.match(/!\d+/)[0] : ""
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
