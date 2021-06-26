const getSchedule = require("./schedule");
const getMessages = require("./message");
const colorize = require("./colorize");
const getSlugs = require("./slugs"); 
const inquirer = require("inquirer");
const fs = require("fs");
const basedir = require("os").homedir() + "/.wilma/";
let wilma, slug;

if(fs.existsSync(basedir) && fs.existsSync(basedir + "creds.json")) {
    let creds = require(basedir + "creds.json");
    wilma = creds.wilma;
    slug = creds.slug;
}

module.exports = {
    homework: async (_, get) => {
        let { Groups: groups } = await get("overview");

        if(groups.length < 1 ) {
            console.log(colorize("You are not in any groups.","warning"));
            return;
        }

        let exists = false;

        groups.forEach(g => {
            if(g.Homework.length<1 || !g.Homework.some(h => new Date() - new Date(h.Date) < 1000 * 60 * 60 * 24 * 7)) return;
            exists = true;
            console.log(colorize('----------',"border"));
            console.log(colorize(`${g.Name} | ${g.CourseName}`,"title"));
            g.Homework.filter(h => new Date() - new Date(h.Date)  < 1000* 60 * 60 * 24 * 7).forEach(h => {
                console.log(colorize(`${h.Date} - ${h.Homework}`,"text"));
            })
        })
        if(exists) {
            console.log(colorize('----------',"border"));
        } else {
            console.log(colorize("Yey! You haven't gotten any homework in the last 7 days!","success"));
        }
    },

    courses: async (_, get) => {
        let { Groups: groups } = await get("overview");

        if(groups.length < 1 ) {
            console.log(colorize("You are not in any groups.","warning"));
            return;
        }

        const longestCode = groups.map(g=>g.Name).reduce((long, str) => Math.max(long, str.length), 0);
        const longestName = groups.map(g=>(g.CourseName || g.Name)).reduce((long, str) => Math.max(long, str.length), 0);

        console.log(colorize(`Code ${" ".repeat(longestCode - 4)}| Name ${" ".repeat(longestName - 4)}| Started    | Ends       | Teachers`,"title"));

        groups.forEach(g => {
            console.log(colorize(`${g.Name} ${" ".repeat(longestCode - g.Name.length)}| ${(g.CourseName ? g.CourseName : g.Name)} ${" ".repeat(longestName - ( g.CourseName ? g.CourseName.length : g.Name.length))}| ${g.StartDate} | ${g.EndDate} | ${g.Teachers.map(t=>t.TeacherName).join(", ")}`,"text"));
        })


    },

    schedule: async token => {
        let schedule = await getSchedule(wilma, token, slug);

        if(Object.keys(schedule).length === 0) {
            console.log(colorize("No classes this week!", "text"));
            return;
        }

        const longestLineLength = Object.values(schedule).map(v => {
            return Object.values(v).map(v2 => {
                return ` ${v2.name} ${v2.teacher} ${v2.room} `.length;
            }).reduce((long, len) => Math.max(long, len), 0);
        }).reduce((long, len) => Math.max(long, len), 0);

        let timeTexts = [];
        Object.values(schedule).forEach(v=>{
            Object.values(v).forEach(k=>{
                if(!timeTexts.includes(k.start)) timeTexts.push(k.start);
            });
        });
        
        timeTexts = timeTexts.sort((a, b) => {
            let [ ah, am ] = a.split(":").map(Number);
            let [ bh, bm ] = b.split(":").map(Number);
            return (ah * 60 + am) - (bh * 60 + bm);
        });

        const longestTime = Math.max(...timeTexts.map(v=>v.length))

        const weekdays = [ "Mon", "Tue", "Wed", "Thu", "Fri" ];

        console.log(colorize("+" + "-".repeat(longestTime+2)+ "+" + ("-".repeat(longestLineLength)+"+").repeat(5),"border"))
        console.log(`${colorize("|","border")} ${" ".repeat(longestTime)} ${colorize("|","border")}${Array.from(Array(5).keys()).map((_,i)=>` ${colorize(weekdays[i],"title")}${" ".repeat(longestLineLength-weekdays[i].length-1)}`).join(colorize("|","border"))}${colorize("|","border")}`)
        console.log(colorize("+" + "=".repeat(longestTime+2)+ "+" + ("=".repeat(longestLineLength)+"+").repeat(5),"border"))

        for(let i = 0; i < timeTexts.length; i++) {
            console.log(`${colorize("|","border")} ${colorize(timeTexts[i],"title")}${" ".repeat(longestTime-timeTexts[i].length)} ${colorize("|","border")}${(()=>{
                let lessons = [];
                for(let j = 0; j < 5; j++) {
                    let lesson = schedule[j.toString()] ? Object.values(schedule[j.toString()]).find(e=> e.start == timeTexts[i]) : null;
                    if(lesson == null) {
                        lessons[j] = " ".repeat(longestLineLength);
                    } else {
                        let tmp = ` ${lesson.name} ${lesson.room} ${lesson.teacher} `;
                        lessons[j] = `${colorize(tmp,"text")}${" ".repeat(longestLineLength-tmp.length)}`;
                    }
                }
                return lessons;
            })().join(colorize("|","border"))}${colorize("|","border")}`);

            console.log(colorize("+" + "-".repeat(longestTime+2) + "+" + ("-".repeat(longestLineLength)+"+").repeat(5),"border"))
        }
    },

    messages: async (token, _, sub) => {
        if (!sub) {
            sub = 1;
        }

        let messages = await getMessages("list", wilma, token, slug);
        parsed = JSON.parse(messages);

        if(parseInt(sub) < 1 || sub > Math.ceil(parsed.Messages.length/10)) {
            console.log(colorize("That page doesnt exists.", "warning"))
            return;
        }

        let senders = [];
        Object.values(parsed.Messages).forEach((v,i) => {
            senders[i] = v.Sender;
        })
        const longestSender = Math.max(...senders.map(v => v.length));
        Object.values(parsed.Messages).forEach((v, i) => {
            if (sub * 10 - 1 >= i && sub * 10 <= i + 10) {
                console.log(colorize(i+1 + ': ' + ' '.repeat(3-i.toString().length) + v.Sender + ' '.repeat(longestSender-v.Sender.length) + v.TimeStamp,"title") + colorize(' | ',"border") + colorize(v.Subject,"text"));
            }
        });
    },

    message: async (token, _, sub) => {
        if (!sub) {
            sub = 1;
        }

        let messaged = await getMessages("list", wilma, token, slug);
        parsed = JSON.parse(messaged);

        if(parseInt(sub) < 1 || sub > parsed.Messages.length - 1 || isNaN(parseInt(sub))) {
            console.log(colorize("There's no messages with that number.", "warning"))
            return;
        }

        let messageInfo = parsed.Messages[sub-1];
        let message = await getMessages(messageInfo.Id, wilma, token, slug);

        let filtered = message.substring(message.search('<div class="ckeditor hidden">'), message.search('<div class="no-side-padding overflow-scrolling">')).replace(/<[^>]+>/g, '');
        console.log(colorize('From: ' + messageInfo.Sender + '  At: ' + messageInfo.TimeStamp + '\n\n',"title"));
        console.log(colorize(filtered.replace(/&auml;/g,'ä').replace(/&ouml;/g,'ö').replace(/&nbsp;/g,'').trim(),"text"));
    },

    exams: async (_, get, sub) => {
        let { Exams: exams } = await get("overview");

        if (!sub) {
            sub = "coming";
        }

        let longestDate, longestCourse;

        switch(sub) {
            case "coming":
                exams = exams.filter(e=> new Date(e.Date.split(".").reverse().join(".")).getTime() >= Date.now())
                if(exams.length<1) {
                    console.log(colorize("Yey! You don't have any exams nearby!", "success"));
                    return;
                }
                longestDate = exams.map(e=>e.Date).reduce((long, str) => Math.max(long, str.length), 0);
                longestCourse = exams.map(e=>e.Course).reduce((long, str) => Math.max(long, str.length), 0);
    
                console.log(colorize(`Date ${" ".repeat(longestDate - 4)}| Course ${" ".repeat(longestCourse- 6)}| Name`,"title"));
    
                exams.forEach(e => {
                    console.log(colorize(`${e.Date} ${" ".repeat(longestDate - e.Date.length)}| ${e.Course} ${" ".repeat(longestCourse - e.Course.length)}| ${e.Name}`,"text"));
                })
                break;
            case "past":
                exams = exams.filter(e=> new Date(e.Date.split(".").reverse().join(".")).getTime() <= Date.now())
                if(exams.length<1) {
                    console.log(colorize("You haven't had any exams yet."),"warning");
                    return;
                }
                longestDate = exams.map(e=>e.Date).reduce((long, str) => Math.max(long, str.length), 0);
                longestCourse = exams.map(e=>e.Course).reduce((long, str) => Math.max(long, str.length), 0);
    
                console.log(colorize(`Date ${" ".repeat(longestDate - 4)}| Course ${" ".repeat(longestCourse- 6)}| Name`,"title"));
    
                exams.forEach(e => {
                    console.log(colorize(`${e.Date} ${" ".repeat(longestDate - e.Date.length)}| ${e.Course} ${" ".repeat(longestCourse - e.Course.length)}| ${e.Name}`,"text"));
                })
                break;
            case "graded":
                exams = exams.filter(e=>e.Grade)
                if(exams.length<1) {
                    console.log(colorize("You haven't had any exams yet."),"warning");
                    return;
                }
                longestDate = exams.map(e=>e.Date).reduce((long, str) => Math.max(long, str.length), 0);
                longestCourse = exams.map(e=>e.Course).reduce((long, str) => Math.max(long, str.length), 0);
                let longestGrade = exams.map(e=>e.Grade).reduce((long, str) => Math.max(long, str.length), 0);

                longestGrade = longestGrade < 5 ? 5 : longestGrade

                console.log(colorize(`Date ${" ".repeat(longestDate - 4)}| Course ${" ".repeat(longestCourse - 6)}| Grade ${" ".repeat(longestGrade - 5 > 0 ? longestGrade - 5 : 0)}| Name`,"title"));
    
                exams.forEach(e => {
                    console.log(colorize(`${e.Date} ${" ".repeat(longestDate - e.Date.length)}| ${e.Course} ${" ".repeat(longestCourse - e.Course.length)}| ${e.Grade} ${" ".repeat(longestGrade - e.Grade.length)}| ${e.Name}`,"text"));
                })
                break;
            default:
                return console.log(colorize("Invalid subcommand.", "warning"))
        }
    },

    logout: async () => {
        try {
            fs.unlinkSync(basedir + "creds.json");
            console.log(colorize("Successfully logged out.", "success"));
            process.exit(0);
        } catch(e) {
            console.log(colorize("Something went wrong! You can still manually delete the creds file from ~/.wilma/creds.json", "error"));
        }
    },

    switch: async (token, _, __, interactive) => {
        let slugs = await getSlugs(wilma, token);
        if(slugs.length > 1) {
            let ans = await inquirer.prompt({
                type: "list",
                name: "slug",
                message: "What role do you want to use?",
                choices: slugs.map(s=>`${s.slug} | ${s.name} - ${s.school}`)
            })
            let slug = ("!" + ans.slug).match(/!\d+/)[0];
            let slugData = slugs.find(s=>s.slug == slug.slice(1))
            let cur = require(basedir + "creds.json");
            cur.slug = slug;
            fs.writeFileSync(basedir + "creds.json", JSON.stringify(cur));
            console.log(colorize(`Changed your role to "${slugData.name} - ${slugData.school}" (${slug.slice(1)})`, "success"));
            if(interactive) {
                console.log(colorize("Interactive cli requires reload for change to happen.", "warning"));
                process.exit(0);
            }
        } else if(slugs.length == 1) {
            console.log(colorize("Your account only has one role. Not changed.", "warning"));
        } else {
            console.log(colorize("Your account does not have multiple roles.\n" +
                                 "If you wish to change accounts. Logout and log back in.",
                                 "warning"));
        }
    },

    help: async () => {
        console.log(colorize("Valid commands are:\n" +
                             "- homework            | homework from the last 7 days\n" +
                             "- courses             | your courses\n" +
                             "- schedule            | schedule for this week\n" +
                             "- messages [page]     | all messages\n" +
                             "- message [number]    | Read message\n" +
                             "- exams [past/graded] | coming exams\n" +
                             "- logout              | logout of wilmacli\n" +
                             "- switch              | change role / slug\n" +
                             "- exit                | exit interactive shell",
                             "text"));
    }
}
