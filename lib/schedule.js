const bent = require("bent");

// OPENWILMA CODE BEGINS
// THIS FUNCTION HAS BEEN SLIGHTLY MODIFIED TO SUIT MY NEEDS BETTER
function formatSchedule(data){
    try {
        data = "[" + data.split("[")[1].split("]")[0] + "]";
        data = JSON.parse(data);
        let lessons = [];
        for(let i = 0; data.length > i; i++){
            let entry = data[i];
            lessons.push({
                start: entry.Start,
                end: entry.End,
                name: entry.Text["0"],
                position: {
                    x: entry.X1 != 0 ? entry.X1 * 0.0001 : 0,
                    y: entry.Y1 != 0 ? entry.Y1 + 1 : entry.Y1
                },
                room: (Object.keys(entry.HuoneInfo["0"]).length ? entry.HuoneInfo["0"]["0"].lyhenne : "None"),
                teacher: entry.OpeInfo["0"]["0"].lyhenne
            });
        }
        let schedule = {};
        for(let i = 0; lessons.length > i; i++){
            let lesson = lessons[i];
            if(schedule[lesson.position.x] == undefined) schedule[lesson.position.x] = {};
            schedule[lesson.position.x][lesson.position.y] = lesson;
        }
        return schedule;
    } catch(err){
        throw err;
    }
}
// OPEMWILMA CODE ENDS

/**
 * Function to get wilma schedule
 * @Function
 * @param {String} wilma url for wilma
 * @param {String} token wilma token
 * @param {String} slug wilma slug if exists
 * @returns {Promise<Object>} resolves to object with schedule
 */
const schedule = (wilma, token, slug) => {
    return new Promise(async (resolve, reject) => {
        try {
            let scheduleHtml = await bent("GET", 200, `${wilma}${slug?`/${slug}`:''}/schedule`, "string", {
                "Cookie": `Wilma2SID=${token};`
            })();
            resolve(formatSchedule(scheduleHtml))
        } catch(e) {
            reject(e);
        }
    })
}

module.exports = schedule;
