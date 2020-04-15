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

const app = express();

let browser = null;
async function setupBrowser() {
    browser = browser || await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
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
        appleParser(browser, req.params.group, req.params.album)
    ]).then((results)=> {
        browser.close();
        res.send(results);
    })
    //const yandex = await yandexParser(browser, 'Asking Alexandria', 'Down To Hell');

});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
