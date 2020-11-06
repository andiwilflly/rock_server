const NodeCache = require( "node-cache" );
const cache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

const bandsintownParser = require('../../@parsers/bandsintown.parser');
// Utils
const setupBrowser = require('../utils/setupBrowser.utils');


let browser = null;

module.exports = async function (req, res) {
    const artist = req.params.artist.trim();
    const key = `concerts/${artist}`;

    const cachedResults = cache.get(key);

    if(cachedResults) return res.send(cachedResults);

    if(browser) {
        res.status(500).send('Another parser in progress...');
        return;
    }

    browser = await setupBrowser();

    console.time(`👮 FIND CONCERTS | ${artist}`);

    const results = await bandsintownParser(browser, artist);

    if(browser) await browser.close();
    browser = null;

    console.timeEnd();

    cache.set(key, results, 86400000); // 1 day
    res.send(results);
};