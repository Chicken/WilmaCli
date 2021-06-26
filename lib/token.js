const bent = require("bent");

/**
 * Function to get wilma token for further actions
 * @Function
 * @param {String} user username for wilma
 * @param {String} pass password for wilma
 * @param {String} url base wilma url
 * @returns {Promise<String>} resolves to string token
 */
const token = async (user, pass, url) => {
    let { SessionID: sesid } = await bent("GET", 200, `${url}/index_json`, "json")();
    let login = await bent("POST", 303, `${url}/index_json?Login=${user}&Password=${encodeURIComponent(pass)}&SESSIONID=${sesid}&CompleteJson=true&format=json`)();
    return login.headers['set-cookie'].find(c => c.includes("Wilma2SID")).split(";")[0].split("=")[1];
}

module.exports = token;
