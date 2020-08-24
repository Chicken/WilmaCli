const bent = require("bent");

// OPENWILMA CODE BEGINS
// THIS FUNCTION HAS BEEN SLIGHTLY MODIFIED TO SUIT MY NEEDS BETTER
function formatSchedule(data){
    try {
        data = "[" + data.split("[")[1].split("]")[0] + "]";
        data = JSON.parse(data);
        let schedule = [ [ ], [ ], [ ], [ ], [ ] ];
        for(let i = 0; data.length > i; i++){
            let entry = data[i];
            let day = entry.X1 != 0 ? entry.X1 * 0.0001 : 0;
            schedule[day].push({
                start: entry.Start,
                end: entry.End,
                name: entry.Text["0"],
                position: {
                    x: day,
                    y: Math.round(entry.Y1 / 90)
                },
                room: entry.HuoneInfo["0"]["0"].lyhenne,
                teacher: entry.OpeInfo["0"]["0"].lyhenne
            });
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