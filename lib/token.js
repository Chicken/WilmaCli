const bent = require("bent");

/**
 * Function to get wilma token for further actions
 * @Function
 * @param {String} user username for wilma
 * @param {String} pass password for wilma
 * @param {String} url base wilma url
 * @returns {Promise<String>} resolves to string token
 */
const token = (user, pass, url) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { SessionID: sesid } = await bent("GET", 200, `${url}/index_json`, "json")();
            let login = await bent("POST", 303, `${url}/index_json?Login=${user}&Password=${pass}&SESSIONID=${sesid}&CompleteJson=true&format=json`)();
            resolve(login.headers['set-cookie'][1].split(";")[0].split("=")[1]);
        } catch(e) {
            reject(e);
        }
    })
}

module.exports = token;