const bent = require("bent");

/**
 * Function to get slugs for wilma user
 * @Function
 * @param {String} url wilma url
 * @param {String} token wilma token
 * @returns Promise, resolves to array of slug objects
 */
const getSlugs = (wilma, token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const slugRegEx = /<a class="text-style-link" href="\/!(\d+)\/">([A-Za-zåäöÅÄÖ ]+) <small>([A-Za-zåäöÅÄÖ ]+)<\/small>/g;
            const page = await bent("GET", 200, wilma, "string", {
                "Cookie": `Wilma2SID=${token};`
            })();
            resolve([...page.matchAll(slugRegEx)].map(s=>({
                slug: s["1"],
                name: s["2"],
                school: s["3"]
            })));
        } catch(e) {
            reject(e);
        }
    })
}

module.exports = getSlugs;