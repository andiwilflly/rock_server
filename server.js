const firebase = require('firebase');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const cron = require('node-cron');
const admin = require("firebase-admin");
const express = require('express');
const newReleases = require('./newReleases/newReleases');
const yandexParser = require('./@parsers/yandex.parser');
const googleParser = require('./@parsers/google.parser');
const appleParser = require('./@parsers/apple.parser');
const youTubeParser = require('./@parsers/youtube.parser');
const soundCloudParser = require('./@parsers/soundcloud.parser');
const lastFmParser = require('./@parsers/last.fm.parser');


const app = express();


cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
});


const serviceAccount = require("./newrockbot-firebase-adminsdk-mb9q7-2767b30f25.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://newrockbot.firebaseio.com"
});


// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDJjTBG3HPioF_WeLURsCUnuWHahxWxAu8",
    authDomain: "newrockbot.firebaseapp.com",
    databaseURL: "https://newrockbot.firebaseio.com",
    projectId: "newrockbot",
    storageBucket: "newrockbot.appspot.com",
    messagingSenderId: "189865837490",
    appId: "1:189865837490:web:7f5be511e85d79c8af1aab",
    measurementId: "G-LEHMM6F8DW"
};
firebase.initializeApp(firebaseConfig);

console.log('firebase APP initialized...');


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

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/newReleases/:days', function (req, res) {
    newReleases(res);
});

app.get('/newReleases/:artist/:days', function (req, res) {
    // newReleases(res);
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
        !resources.length || resources.includes('lastfm') ? lastFmParser(browser, group, album) : null,
        !resources.length || resources.includes('yandex') ? yandexParser(browser, group, album) : null,
        !resources.length || resources.includes('google') ? googleParser(browser, group, album) : null,
        !resources.length || resources.includes('apple') ? appleParser(browser, group, album) : null,
        !resources.length || resources.includes('soundcloud') ? soundCloudParser(browser, group, album) : null,
        !resources.length || resources.includes('youtube') ? youTubeParser(browser, group, album, req.params.group) : null,
    ]).then((results)=> {
        browser.close();
        res.send(results.filter(Boolean));
    })
    //const yandex = await yandexParser(browser, 'Asking Alexandria', 'Down To Hell');

});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
