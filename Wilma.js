const getToken = require("./lib/token");
const getSchedule = require("./lib/schedule");
const getMessages = require("./lib/message");
const bent = require("bent");
const colorize = require("./lib/colorize");

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
        console.error(colorize("Failed to login.","error"));
        process.exit(1);
    }

    let get = bent("GET", 200, `${wilma}${slug?`/${slug}`:''}/`, "json", {
        "Cookie": `Wilma2SID=${token};`
    });

    console.log(colorize("Successfully logged in.","success"));

    let {Groups: groups, Exams: exams, Schedule: schedule} = await get("overview");

    switch(command) {

        case 'homework':
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
            break;

        case 'courses':
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

            console.log(colorize("+" + "-".repeat(longestTime+2)+ "+" + ("-".repeat(longestLineLength)+"+").repeat(5),"border"))
            console.log(`${colorize("|","border")} ${" ".repeat(longestTime)} ${colorize("|","border")}${Array.from(Array(5).keys()).map((_,i)=>` ${colorize(weekdays[i],"title")}${" ".repeat(longestLineLength-weekdays[i].length-1)}`).join(colorize("|","border"))}${colorize("|","border")}`)
            console.log(colorize("+" + "=".repeat(longestTime+2)+ "+" + ("=".repeat(longestLineLength)+"+").repeat(5),"border"))

            for(let i = 0; i < startTimes.length; i++) {
                console.log(`${colorize("|","border")} ${colorize(timeTexts[i],"title")}${" ".repeat(longestTime-timeTexts[i].length)} ${colorize("|","border")}${(()=>{
                    let lessons = [];
                    for(let j = 0; j < 5; j++) {
                        let lesson = Object.values(schedule[j.toString()]).find(e=> e.start == startTimes[i]);
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
            // subcommand to get extra info from a lesson with like
            // node . schedule b3
            // tells more info for tuesdays third lesson
            break;

        case 'messages':
			//test
			if (!process.argv[3]) {
				console.log(colorize("Please give a page to display. E.g. messages 1.","warning"));
				break;
			}

			let messages = await getMessages("list", wilma, token, slug);
			parsed = JSON.parse(messages);
			let senders = []
			Object.values(parsed.Messages).forEach((v,i)=>{
				senders[i]=v.Sender;
			})
			const longestSender = Math.max(...senders.map(v=>v.length))
			Object.values(parsed.Messages).forEach((v, i) => {
				if (process.argv[3]*10>=i && process.argv[3]*10<=i+10) {
					console.log(colorize(i +': ' + ' '.repeat(3-i.toString().length)  + v.Sender + ' '.repeat(longestSender-v.Sender.length) + v.TimeStamp,"title") +colorize(' | ',"border") + colorize(v.Subject,"text"));
				}
			});
            break;

		case 'message':
			if (!process.argv[3]) {
				console.log(colorize("Please give a message number to display. E.g. message 1.","warning"));
				break;
			}
		 	messaged = await getMessages("list", wilma, token, slug);
			parsed=JSON.parse(messaged);
			let messageInfo = parsed.Messages[process.argv[3]]
			let message = await getMessages(messageInfo.Id, wilma, token, slug);
			//Some shitty thing to get only the message from the dense jungle of HTML tags
			filtered=message.substring(message.search('<div class="ckeditor hidden">'),message.search('<div class="no-side-padding overflow-scrolling">')).replace(/<[^>]+>/g, '');
			console.log(colorize('From: '+messageInfo.Sender + '  At: '+messageInfo.TimeStamp + '\n\n',"title"))
			console.log(colorize('          '+filtered.replace(/&auml;/g,'ä').replace(/&ouml;/g,'ö').replace(/&nbsp;/g,'').replace(/\n/g,'\n          '),"text"));
			break;

        case 'exams':
            if(exams.length<1) {
                console.log(colorize("Yey! You don't have any exams nearby!"),"success");
                return;
            }
            const longestDate = exams.map(e=>e.Date).reduce((long, str) => Math.max(long, str.length), 0);
            const longestCourse = exams.map(e=>e.Course).reduce((long, str) => Math.max(long, str.length), 0);

            console.log(colorize(`Date ${" ".repeat(longestDate - 4)}| Course ${" ".repeat(longestCourse- 6)}| Name`,"title"));

            exams.forEach(e => {
                console.log(colorize(`${e.Date} ${" ".repeat(longestDate - e.Date.length)}| ${e.Course} ${" ".repeat(longestCourse - e.Course.length)}| ${e.Name}`,"text"));
            })

            break;

        case 'help':
            console.log(colorize("Valid commands are:\n- homework        | homework from the last 7 days\n- courses         | your courses\n- schedule        | schedule for this week\n- messages <page> | all messages\n- message <number>|Read message\n- exams           | coming exams","text"));
            break;

        default:
            console.log(colorize("Not a valid command. Do \"node . help\""));
    }

})();
