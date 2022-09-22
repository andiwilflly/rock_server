const fetch = require("node-fetch");
//const admin = require("firebase-admin");

//const yandexParser = require('../../@parsers/yandex.parser');
const deezerParser = require('../../@parsers/deezer.parser');
//const googleParser = require('../../@parsers/google.parser');
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
    const callback = req.query.callback;

    if(browser) {
        if (req.query.flush) {
            browser.close();
            browser = null;
        } else {
            res.status(500).send('Another parser in progress...');
            return;
        }
    }

    browser = await setupBrowser();

    const group = req.params.group.toLowerCase().trim();
    const album = req.params.album.toLowerCase().trim();

    console.time(`👮 TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')}`);

    await Promise.all([
        !resources.length || resources.includes('deezer') ? deezerParser(browser, group, album) : null,

        !resources.length || resources.includes('spotify') ? spotifyParser(browser, group, album) : null,
        !resources.length || resources.includes('soundcloud') ? soundCloudParser(browser, group, album) : null,

        !resources.length || resources.includes('lastfm') ? lastFmParser(browser, group, album) : null,
        !resources.length || resources.includes('youtube') ? youTubeParser(browser, group, album, req.params.group, req.params.album) : null,
        //!resources.length || resources.includes('yandex') ? yandexParser(browser, group, album) : null,
        // !resources.length || resources.includes('google') ? googleParser(browser, group, album) : null,
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


        // const message2 = {
        //     notification: {
        //         title: `${group} - ${album}`,
        //         body: `(${Object.keys(results).join(',')})`
        //     },
        //     topic: 'JKooKnosrveuLhmbnpdDVAUk6Cp1' // 'allDevices'
        // };

        // Send a message to the device corresponding to the provided
        // registration token.
        // admin.messaging().send(message2)
        //     .then((response) => {
        //         // Response is a message ID string.
        //         console.log('Successfully sent message2:', response);
        //         // res.send('Hello World!');
        //     })
        //     .catch((error) => {
        //         console.log('Error sending message2:', error);
        //     });


        if(callback) {
            await fetch(`https://rockbot.pixis.com.ua/index.php?save_links=1&results=${encodeURIComponent(JSON.stringify({
                group,
                album,
                results
            }))}`, {  method: "POST" }).catch(console.log);

            console.log(`👮 POST results to 'rockbot.pixis.com.ua'`);
        }
    });

    if(browser) await browser.close();
    browser = null;

    console.timeEnd(`👮 TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')}`);
};
