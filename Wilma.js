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
        console.error(chalk.redBright("Failed to login."));
        process.exit(1);
    }

    let get = bent("GET", 200, `${wilma}${slug?`/${slug}`:''}/`, "json", {
        "Cookie": `Wilma2SID=${token};`
    });

    console.log(chalk.greenBright("Successfully logged in."));

    switch(command) {

        case 'homework':
            let { Groups: groups } = await get("overview");

            if(groups.length < 1 ) {
                console.log(chalk.redBright("You are not in any groups."));
                return;
            }

            let exists = false;

            groups.forEach(g => {
                if(g.Homework.length<1 || !g.Homework.some(h => new Date() - new Date(h.Date) < 1000 * 60 * 60 * 24 * 7)) return;
                exists = true;
                console.log(chalk.blue('----------'));
                console.log(chalk.magenta(`${g.Name} | ${g.CourseName}`));
                g.Homework.filter(h => new Date() - new Date(h.Date)  < 1000* 60 * 60 * 24 * 7).forEach(h => {
                    console.log(chalk.cyanBright(`${h.Date} - ${h.Homework}`));
                })
            })
            if(exists) {
                console.log(chalk.blue('----------'));
            } else {
                console.log(chalk.blueBright("Yey! You haven't gotten any homework in the last 7 days!"));
            }
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
            console.log(chalk.redBright("Not a valid command."), chalk.yellow("\nValid commands are:\n- homework | homework from the last 7 days\n- courses | your courses\n- schedule | schedule for this week\n- messages | unread messages\n- exams | coming exams"));
    }

})();