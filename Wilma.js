const getToken = require("./lib/token");
const getSchedule = require("./lib/schedule");
const bent = require("bent");
const chalk = require("chalk");
const command = process.argv[2];
require("dotenv").config();
const { WILMA_USER: user,
        WILMA_PASS: pass,
        WILMA_URL: wilma,
        WILMA_SLUG: slug
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

    let {Groups: groups, Exams: exams, Schedule: schedule} = await get("overview");

    switch(command) {

        case 'homework':
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
            if(groups.length < 1 ) {
                console.log(chalk.redBright("You are not in any groups."));
                return;
            }

            const longestCode = groups.map(g=>g.Name).reduce((long, str) => Math.max(long, str.length), 0);
            const longestName = groups.map(g=>(g.CourseName || g.Name)).reduce((long, str) => Math.max(long, str.length), 0);

            console.log(chalk.magentaBright(`Code ${" ".repeat(longestCode - 4)}| Name ${" ".repeat(longestName - 4)}| Started    | Ends       | Teachers`));
            
            groups.forEach(g => {
                console.log(chalk.magenta(`${g.Name} ${" ".repeat(longestCode - g.Name.length)}| ${(g.CourseName ? g.CourseName : g.Name)} ${" ".repeat(longestName - ( g.CourseName ? g.CourseName.length : g.Name.length))}| ${g.StartDate} | ${g.EndDate} | ${g.Teachers.map(t=>t.TeacherName).join(", ")}`));
            })


            break;

        case 'schedule':
            let schedule = await getSchedule(wilma, token, slug);
            console.log(schedule);

            // I gave up on now, formatting an ascii table with
            // the data I have is hard, feel free to make a pull
            // request that makes this work. I made getting 
            // the schedule json ready and made some code below.

            //const longestLine = schedule.map(e => e.map(e2=>` ${e2.name} ${e2.teacher} ${e2.room} `).reduce((long, str) => Math.max(long, str.length), 0)).reduce((long, len) => Math.max(long, len), 0);
            //const mostLessonsInDay = schedule.map(e => e.length).reduce((long, len) => Math.max(long, len), 0);
            //console.log("-".repeat(longestLine*5))
            //for(let i = 0; i<5; i++) {
            //    console.log(schedule.map(e=>e[i]).map(e=>{
            //        let txt = ` ${e ? e.name : ""} ${e ? e.teacher : ""} ${e ? e.room : ""}`;
            //        return ` `
            //    }).join("|"))
            //    console.log("-".repeat(longestLine*5))
            //}
            //console.log(`| ${e[0][0].name} ${e[0][0].teacher} ${e[0][0].room} | ${} ${} ${} | ${} ${} ${} | ${} ${} ${} | ${} ${} ${} |`);
            break;

        case 'messages':
            // pagination
            // 10 per page
            // id | sender | subject
            // subcommand to read from id
            break;

        case 'exams':
            if(exams.length<1) {
                console.log(chalk.blueBright("Yey! You don't have any exams nearby!"));
                return;
            }
            const longestDate = exams.map(e=>e.Date).reduce((long, str) => Math.max(long, str.length), 0);
            const longestCourse = exams.map(e=>e.Course).reduce((long, str) => Math.max(long, str.length), 0);

            console.log(chalk.magentaBright(`Date ${" ".repeat(longestDate - 4)}| Course ${" ".repeat(longestCourse- 6)}| Name`));
            
            exams.forEach(e => {
                console.log(chalk.cyanBright(`${e.Date} ${" ".repeat(longestDate - e.Date.length)}| ${e.Course} ${" ".repeat(longestCourse - e.Course.length)}| ${e.Name}`));
            })

            break;

        case 'help':
            console.log(chalk.yellow("Valid commands are:\n- homework | homework from the last 7 days\n- courses  | your courses\n- schedule | schedule for this week\n- messages | unread messages\n- exams    | coming exams"));
            break;

        default:
            console.log(chalk.redBright("Not a valid command. Do \"node . help\""));
    }

})();