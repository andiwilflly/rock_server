//const admin = require("firebase-admin");

const deezerParser = require('../../@parsers/deezer.parser');
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

const ALL_SOURCES = ['deezer', 'spotify', 'soundcloud', 'lastfm', 'youtube', 'apple'];

let browser = null;

module.exports = async function (req, res) {
    const resources = req.query.q ? req.query.q.toLowerCase().split(',').filter(s => ALL_SOURCES.includes(s)) : [];
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

    const group = req.params.group.toLowerCase().trim();
    const album = req.params.album.toLowerCase().trim();
    const requestedSources = resources.length ? resources : ALL_SOURCES;

    console.time(`👮 TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')}`);

    // Check cache before starting browser
    const cachedResults = {};
    const sourcesToParse = [];

    for (const source of requestedSources) {
        const cached = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `${source} | ${group} | ${album}` });
        const isValid = cached && !cached.link.includes('search?');
        if (isValid) {
            console.log(`🌼 MONGO DB | ${source.toUpperCase()} PARSER: return prev result...`);
            cachedResults[source] = cached;
        } else {
            sourcesToParse.push(source);
        }
    }

    if (!sourcesToParse.length) {
        console.timeEnd(`👮 TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')}`);
        return res.send(cachedResults);
    }

    browser = await setupBrowser();

    try {
        const parserResults = await Promise.all([
            sourcesToParse.includes('deezer') ? deezerParser(browser, group, album) : null,
            sourcesToParse.includes('spotify') ? spotifyParser(browser, group, album) : null,
            sourcesToParse.includes('soundcloud') ? soundCloudParser(browser, group, album) : null,
            sourcesToParse.includes('lastfm') ? lastFmParser(browser, group, album) : null,
            sourcesToParse.includes('youtube') ? youTubeParser(browser, group, album) : null,
            sourcesToParse.includes('apple') ? appleParser(browser, group, album) : null,
        ]);

        const freshResults = parserResults.filter(Boolean);

        for(const resource of freshResults) {
            if(resource.link) {
                const prevResource = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `${resource.source} | ${group} | ${album}` });
                if(!prevResource) {
                    await global.MONGO_COLLECTION_PARSER.insertOne({
                        ...resource,
                        _id: `${resource.source} | ${group} | ${album}`
                    });
                    console.log(`🌼 MONGO DB | SAVED: [${resource.source} | ${group} | ${album}]`);
                }
            }
        }

        const results = {
            ...cachedResults,
            ...freshResults.reduce((acc, resource) => {
                acc[resource.source] = resource;
                return acc;
            }, {})
        };

        res.send(results);

        if(callback) {
            await fetch(`https://rockbot.pixis.com.ua/index.php?save_links=1&results=${encodeURIComponent(JSON.stringify({
                group,
                album,
                results
            }))}`, { method: "POST" }).catch(console.log);

            console.log(`👮 POST results to 'rockbot.pixis.com.ua'`);
        }
    } finally {
        if(browser) await browser.close();
        browser = null;
        console.timeEnd(`👮 TIME FIND ALBUM |${group} - ${album} | ${resources.join(',')}`);
    }
};
