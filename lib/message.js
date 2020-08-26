const bent = require("bent");
//OPENWILMA CODE BEGINS


/**
 * Function to test messages
 * @Function
 * @param {String} wilma url for wilma
 * @param {String} token wilma token
 * @param {String} slug wilma slug if exists
 * @returns {Promise<Object>} resolves to object with schedule
 */
const schedule = (id, wilma, token, slug) => {
    return new Promise(async (resolve, reject) => {
        try {
            let messageHtml = await bent("GET", 200, `${wilma}${slug?`/${slug}`:''}/messages/${id}`, "string", {
                "Cookie": `Wilma2SID=${token};`
            })();
            resolve(messageHtml)
        } catch(e) {
            reject(e);
        }
    })
}

module.exports = schedule;
