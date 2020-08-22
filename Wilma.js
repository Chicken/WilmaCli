const getToken = require("./lib/token");
const bent = require("bent");
const chalk = require("chalk");
const command = process.argv[2];
require("dotenv").config();
const { USER: user,
        PASS: pass,
        WILMA: wilma,
        SLUG: slug
    } = process.env;



(async()=>{
    let token = null;

    try {
        token = await getToken(user, pass, wilma);
    } catch(e) {
        console.error(chalk.redBright("Failure logging in."));
        process.exit(1);
    }

    let get = bent("GET", 200, `${wilma}${slug?`/${slug}`:''}/`, "json", {
        "Cookie": `Wilma2SID=${token};`
    });

    console.log(chalk.greenBright("Success logging in."));

    switch(command) {

        case 'test':
            console.log(await get("overview"));
            console.log(chalk.greenBright("Succesful."));
            break;

        case 'homework':

            break;

        case 'courses':

            break;

        case 'schedule':
            
            break;

        case 'messages':

            break;

        case 'exams':

            break;

        default:
            console.log("Not a valid command.\nValid commands are:\n- homework | homework assigned today\n- courses | your courses\n- schedule | schedule for this week\n- messages | messages for today\n- exams | coming exams");
    }

})();