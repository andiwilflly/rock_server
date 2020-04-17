const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const express = require('express');
const yandexParser = require('./@parsers/yandex.parser');
const googleParser = require('./@parsers/google.parser');
const appleParser = require('./@parsers/apple.parser');
const youTobeParser = require('./@parsers/youtobe.parser');
const soundCloudParser = require('./@parsers/soundcloud.parser');
const spotifyParser = require('./@parsers/spotify.pareser');


const app = express();


// When build error
// heroku restart
// heroku builds:cancel
let browser = null;
async function setupBrowser() {
    browser = await puppeteer.launch({
        headless: false,
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

app.get('/', function (req, res) {
    res.send('Hello World!');
});


// https://www.spotify.com/
// https://www.deezer.com/
app.get('/find/:group/:album', async function (req, res) {

    const resources = req.query.q ? req.query.q.toLowerCase().split(',') : [];
    await setupBrowser();
    const group = req.params.group.toLowerCase();
    const album = req.params.album.toLowerCase();

    console.log(resources);
    Promise.all([
        // !resources.length || resources.includes('spotify') ? spotifyParser(browser, group, album) : null,
        !resources.length || resources.includes('yandex') ? yandexParser(browser, group, album) : null,
        !resources.length || resources.includes('google') ? googleParser(browser, group, album) : null,
        !resources.length || resources.includes('apple') ? appleParser(browser, group, album) : null,
        !resources.length || resources.includes('soundcloud') ? soundCloudParser(browser, group, album) : null,
        !resources.length || resources.includes('youtobe') ? youTobeParser(browser, group, album, req.params.group) : null,
    ]).then((results)=> {
        browser.close();
        res.send(results.filter(Boolean));
    })
    //const yandex = await yandexParser(browser, 'Asking Alexandria', 'Down To Hell');

});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
