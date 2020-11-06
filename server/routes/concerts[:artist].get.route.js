const bandsintownParser = require('../../@parsers/bandsintown.parser');
// Utils
const setupBrowser = require('../utils/setupBrowser.utils');


let browser = null;

module.exports = async function (req, res) {

    if(browser) {
        res.status(500).send('Another parser in progress...');
        return;
    }

    browser = await setupBrowser();

    const artist = req.params.artist.trim();

    console.time(`👮 FIND CONCERTS | ${artist}`);

    const results = await bandsintownParser(browser, artist);

    if(browser) await browser.close();
    browser = null;

    console.timeEnd();

    res.send(results);
};