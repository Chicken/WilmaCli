const bent = require("bent");
const getFormKey = require("./formkey");

function formatSchedule(data){
    let lessons = data.map(entry => ({
        start: entry.Start,
        name: entry.Groups[0].ShortCaption,
        position: {
            x: entry.X1 != 0 ? entry.X1 * 0.0001 : 0,
            y: entry.Y1 != 0 ? entry.Y1 + 1 : entry.Y1
        },
        room: entry.Groups?.[0]?.Rooms?.[0]?.Caption ?? "None",
        teacher: entry.Groups[0].Teachers[0].Caption
    }));
    let schedule = {};
    for(let lesson of lessons){
        if(schedule[lesson.position.x] == undefined) schedule[lesson.position.x] = {};
        schedule[lesson.position.x][lesson.position.y] = lesson;
    }
    return schedule;
}

/**
 * Function to get wilma schedule
 * @Function
 * @param {String} wilma url for wilma
 * @param {String} token wilma token
 * @param {String} slug wilma slug if exists
 * @returns {Promise<Object>} resolves to object with schedule
 */
const schedule = async (wilma, token, slug) => {
    let { type, primus } = await getFormKey(wilma, token, slug);
    let { Schedule: schedule } = await bent("GET", 200, `${wilma}${slug?`/${slug}`:''}/schedule/export/${type}s/${primus}`, "json", {
        "Cookie": `Wilma2SID=${token};`
    })();
    return formatSchedule(schedule);
}

module.exports = schedule;
