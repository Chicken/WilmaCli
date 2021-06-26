const bent = require("bent");

/**
 * Function to get wilma formkey
 * @Function
 * @param {String} url base wilma url
 * @param {String} token wilma token
 * @param {String} slug wilma slug if exists
 * @returns {Promise<{
 *   type: String,
 *   primus: String,
 *   hash: String,
 *   key: String
 * }>}
 */
const formkey = async (url, token, slug) => {
    let page = await bent("GET", 200, `${url}${slug?`/${slug}`:''}/`, "string", {
        "Cookie": `Wilma2SID=${token};`
    })();
    let match = page.match(/name="formkey" value="([a-z]*?):(\d*?):([a-f0-9]*?)"/i)
    return {
        type: match[1],
        primus: match[2],
        hash: match[3],
        key: `${match[1]}:${match[2]}:${match[3]}`
    };
}

module.exports = formkey;
