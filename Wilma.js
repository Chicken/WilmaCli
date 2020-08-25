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

            const longestLineLength = Object.values(schedule).map(v => {
                return Object.values(v).map(v2 => {
                    return ` ${v2.name} ${v2.teacher} ${v2.room} `.length;
                }).reduce((long, len) => Math.max(long, len), 0);
            }).reduce((long, len) => Math.max(long, len), 0);

            let startTimes = [];
            Object.values(schedule).forEach(v=>{
                Object.values(v).forEach(k=>{
                    if(!startTimes.includes(k.start)) startTimes.push(k.start);
                })
            })
            startTimes = startTimes.sort((a,b)=>a-b);

            let timeTexts = []
            startTimes.forEach((v,i)=>{
                let hours = Math.floor(v/60);
                let minutes = v - (hours*60);
                timeTexts[i] = `${hours}:${minutes.toString().padStart(2, "0")}`;
            })

            const longestTime = Math.max(...timeTexts.map(v=>v.length))

            const weekdays = [ "Mon", "Tue", "Wed", "Thu", "Fri" ];
            
            console.log(chalk.magenta("+") + chalk.magentaBright("-".repeat(longestTime+2)) + chalk.magenta("+") + (chalk.magentaBright("-".repeat(longestLineLength))+chalk.magenta("+")).repeat(5))
            console.log(`${chalk.magentaBright("|")} ${" ".repeat(longestTime)} ${chalk.magentaBright("|")}${Array.from(Array(5).keys()).map((_,i)=>` ${chalk.cyan(weekdays[i])}${" ".repeat(longestLineLength-weekdays[i].length-1)}`).join(chalk.magentaBright("|"))}${chalk.magentaBright("|")}`)
            console.log(chalk.magenta("+") + chalk.magentaBright("-".repeat(longestTime+2)) + chalk.magenta("+") + (chalk.magentaBright("-".repeat(longestLineLength))+chalk.magenta("+")).repeat(5))

            for(let i = 0; i < startTimes.length; i++) {
                console.log(`${chalk.magentaBright("|")} ${chalk.cyan(timeTexts[i])}${" ".repeat(longestTime-timeTexts[i].length)} ${chalk.magentaBright("|")}${(()=>{
                    let lessons = [];
                    for(let j = 0; j < 5; j++) {
                        let lesson = Object.values(schedule[j.toString()]).find(e=> e.start == startTimes[i]);
                        if(lesson == null) {
                            lessons[j] = " ".repeat(longestLineLength);
                        } else {
                            let tmp = ` ${lesson.name} ${lesson.room} ${lesson.teacher} `;
                            lessons[j] = `${chalk.blue(tmp)}${" ".repeat(longestLineLength-tmp.length)}`;
                        }
                    }
                    return lessons;
                })().join(chalk.magentaBright("|"))}${chalk.magentaBright("|")}`);

                console.log(chalk.magenta("+") + chalk.magentaBright("-".repeat(longestTime+2)) + chalk.magenta("+") + (chalk.magentaBright("-".repeat(longestLineLength))+chalk.magenta("+")).repeat(5))
            }
            // subcommand to get extra info from a lesson with like 
            // node . schedule b3
            // tells more info for tuesdays third lesson
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