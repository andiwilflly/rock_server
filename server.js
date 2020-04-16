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

const app = express();


let browser = null;
async function setupBrowser() {
    browser = await puppeteer.launch({
        headless: true,
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

app.get('/find/:group/:album', async function (req, res) {
    await setupBrowser();

    console.log('GROUP: ', req.params.group, 'ALBUM:', req.params.album);

    Promise.all([
        yandexParser(browser, req.params.group, req.params.album),
        googleParser(browser, req.params.group, req.params.album),
        appleParser(browser, req.params.group, req.params.album),
        youTobeParser(browser, req.params.group, req.params.album)
    ]).then((results)=> {
        browser.close();
        res.send(results);
    })
    //const yandex = await yandexParser(browser, 'Asking Alexandria', 'Down To Hell');

});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
