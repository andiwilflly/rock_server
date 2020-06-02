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

    if(!browser && (resources.includes('yandex') || resources.includes('google') || resources.includes('apple'))) browser = await setupBrowser();
    if(!browser && !resources.length) browser = await setupBrowser();

    const group = req.params.group.toLowerCase();
    const album = req.params.album.toLowerCase();

    console.time(`TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')}`);

    await Promise.all([
        !resources.length || resources.includes('spotify') ? spotifyParser(req.params.group, req.params.album) : null,
        !resources.length || resources.includes('lastfm') ? lastFmParser(req.params.group, req.params.album) : null,
        !resources.length || resources.includes('soundcloud') ? soundCloudParser(req.params.group, req.params.album) : null,
        !resources.length || resources.includes('youtube') ? youTubeParser(req.params.group, req.params.album) : null,

        !resources.length || resources.includes('yandex') ? yandexParser(browser, group, album) : null,
        !resources.length || resources.includes('google') ? googleParser(browser, group, album) : null,
        !resources.length || resources.includes('apple') ? appleParser(browser, group, album) : null,
    ]).then(async (results)=> {
        const pages = await browser.pages();
        console.log('BROWSER PAGES | ', pages.map(page => page.url()));
        pages.forEach(page => page.close());

        res.send(results.filter(Boolean).reduce((res, resource)=> {
            res[resource.source] = resource;
            return res;
        }, {}));
    });

    console.timeEnd(`TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')}`);


    //if(browser) browser.close();
    //browser = null;
};