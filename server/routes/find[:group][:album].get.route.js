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
let isRequestRunning = false;


module.exports = async function (req, res) {
    if(browser && !isRequestRunning) {
        console.log('=== CLOSING BROWSER BEFORE START ===');
        await browser.close();
    }

    isRequestRunning = true;

    const resources = req.query.q ? req.query.q.toLowerCase().split(',') : [];

    if(resources.includes('yandex') || resources.includes('google') || resources.includes('apple')) browser = await setupBrowser();
    if(!resources.length) browser = await setupBrowser();

    const group = req.params.group.toLowerCase();
    const album = req.params.album.toLowerCase();

    console.log(resources, "isRequestRunning: =->>", isRequestRunning);

    await Promise.all([
        !resources.length || resources.includes('spotify') ? spotifyParser(req.params.group, req.params.album) : null,
        !resources.length || resources.includes('lastfm') ? lastFmParser(req.params.group, req.params.album) : null,
        !resources.length || resources.includes('soundcloud') ? soundCloudParser(req.params.group, req.params.album) : null,
        !resources.length || resources.includes('youtube') ? youTubeParser(req.params.group, req.params.album) : null,

        !resources.length || resources.includes('yandex') ? yandexParser(browser, group, album) : null,
        !resources.length || resources.includes('google') ? googleParser(browser, group, album) : null,
        !resources.length || resources.includes('apple') ? appleParser(browser, group, album) : null,
    ]).then((results)=> {
        isRequestRunning = false;
        res.send(results.filter(Boolean).reduce((res, resource)=> {
            res[resource.source] = resource;
            return res;
        }, {}));
    });

    if(browser && !isRequestRunning) browser.close();
    browser = null;
}