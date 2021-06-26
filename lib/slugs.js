const bent = require("bent");

/**
 * Function to get slugs for wilma user
 * @Function
 * @param {String} url wilma url
 * @param {String} token wilma token
 * @returns Promise, resolves to array of slug objects
 */
const getSlugs = async (wilma, token) => {
    const slugRegEx = /<a class="text-style-link" href="\/!(\d+)\/">([A-Za-zåäöÅÄÖ ]+) <small>([A-Za-zåäöÅÄÖ ]+)<\/small>/g;
    const page = await bent("GET", 200, wilma, "string", {
        "Cookie": `Wilma2SID=${token};`
    })();
    return [...page.matchAll(slugRegEx)].map(s => ({
        slug: s["1"],
        name: s["2"],
        school: s["3"]
    }));
}

module.exports = getSlugs;
