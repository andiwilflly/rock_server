const yandexParser = require('../../@parsers/yandex.parser');
const googleParser = require('../../@parsers/google.parser');
const appleParser = require('../../@parsers/apple.parser');
const youTubeParser = require('../../@parsers/youtube.parser');
const soundCloudParser = require('../../@parsers/soundcloud.parser');
const lastFmParser = require('../../@parsers/last.fm.parser');
const spotifyParser = require('../../@parsers/spotify.pareser');
// Utils
const setupBrowser = require('../utils/setupBrowser.utils');


// When build error
// heroku restart
// heroku builds:cancel

let browser = null;

module.exports = async function (req, res) {
    const resources = req.query.q ? req.query.q.toLowerCase().split(',') : [];

    if(!browser) browser = await setupBrowser();

    const group = req.params.group.toLowerCase().trim();
    const album = req.params.album.toLowerCase().trim();

    console.time(`👮 TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')}`);

    await Promise.all([
        !resources.length || resources.includes('spotify') ? spotifyParser(group, album) : null,
        !resources.length || resources.includes('soundcloud') ? soundCloudParser(browser, group, album) : null,

        !resources.length || resources.includes('lastfm') ? lastFmParser(browser, group, album) : null,
        !resources.length || resources.includes('youtube') ? youTubeParser(browser, group, album, req.params.group) : null,
        !resources.length || resources.includes('yandex') ? yandexParser(browser, group, album) : null,
        !resources.length || resources.includes('google') ? googleParser(browser, group, album) : null,
        !resources.length || resources.includes('apple') ? appleParser(browser, group, album) : null,
    ]).then(async (results)=> {
        // if(browser) {
        //     const pages = await browser.pages();
        //     console.log('BROWSER PAGES | ', pages.map(page => page.url()));
        //     pages.forEach(page => page.close());
        // }
        results = results.filter(Boolean);

        for(const resource of results) {
            if(resource.link) {
                const prevResource = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `${resource.source} | ${group} | ${album}` });
                if(!prevResource) {
                    global.MONGO_COLLECTION_PARSER.insertOne({
                        ...resource,
                        _id: `${resource.source} | ${group} | ${album}`
                    });
                    console.log(`🌼 MONGO DB | SAVED: [${resource.source} | ${group} | ${album}]`);
                }
            }
        }

        results = results.reduce((res, resource)=> {
            res[resource.source] = resource;
            return res;
        }, {});

        res.send(results);
    });

    console.timeEnd(`👮 TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')}`);


    // if(browser) browser.close();
    // browser = null;
};