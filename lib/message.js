const bent = require("bent");

/**
 * Function to get messages
 * @Function
 * @param {String} id what to get (list or message ID)
 * @param {String} wilma url for wilma
 * @param {String} token wilma token
 * @param {String} slug wilma slug if exists
 * @returns {Promise<Object>} resolves to object with message(s)
 */
const message = async (id, wilma, token, slug) => {
    let messageHtml = await bent("GET", 200, `${wilma}${slug?`/${slug}`:''}/messages/${id}`, "string", {
        "Cookie": `Wilma2SID=${token};`
    })();
    return messageHtml;
}

module.exports = message;
