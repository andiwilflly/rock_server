const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));


const yandexParser = require('../../@parsers/yandex.parser');
const googleParser = require('../../@parsers/google.parser');
const appleParser = require('../../@parsers/apple.parser');
const youTubeParser = require('../../@parsers/youtube.parser');
const soundCloudParser = require('../../@parsers/soundcloud.parser');
const lastFmParser = require('../../@parsers/last.fm.parser');
const spotifyParser = require('../../@parsers/spotify.pareser');


// When build error
// heroku restart
// heroku builds:cancel

let browser = null;
async function setupBrowser() {
    browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"],
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
        ]
    });
}


module.exports = async function (req, res) {
    if(browser) {
        console.log('=== CLOSING BROWSER BEFORE START ===');
        await browser.close();
    }

    const resources = req.query.q ? req.query.q.toLowerCase().split(',') : [];
    // await setupBrowser();
    // const group = req.params.group.toLowerCase();
    // const album = req.params.album.toLowerCase();

    console.log(resources);

    Promise.all([
        !resources.length || resources.includes('spotify') ? spotifyParser(req.params.group, req.params.album) : null,
        !resources.length || resources.includes('lastfm') ? lastFmParser(req.params.group, req.params.album) : null,
        !resources.length || resources.includes('soundcloud') ? soundCloudParser(req.params.group, req.params.album) : null,
        // !resources.length || resources.includes('yandex') ? yandexParser(browser, group, album) : null,
        // !resources.length || resources.includes('google') ? googleParser(browser, group, album) : null,
        // !resources.length || resources.includes('apple') ? appleParser(browser, group, album) : null,
        !resources.length || resources.includes('youtube') ? youTubeParser(req.params.group, req.params.album) : null,
    ]).then((results)=> {
        // browser.close();
        // browser = null;

        res.send(results.filter(Boolean).reduce((res, resource)=> {
            res[resource.source] = resource;
            return res;
        }, {}));
    });
}