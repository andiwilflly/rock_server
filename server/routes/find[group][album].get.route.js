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
const API_SOURCES = new Set(['deezer', 'lastfm', 'youtube', 'soundcloud', 'apple']);

const PARSERS = {
    deezer:     (_browser, group, album) => deezerParser(null, group, album),
    lastfm:     (_browser, group, album) => lastFmParser(null, group, album),
    youtube:    (_browser, group, album) => youTubeParser(null, group, album),
    spotify:    (browser, group, album) => spotifyParser(browser, group, album),
    soundcloud: (_browser, group, album) => soundCloudParser(null, group, album),
    apple:      (_browser, group, album) => appleParser(null, group, album),
};

let browser = null;

async function postCallback(callback, group, album, results) {
    if (!callback) return;
    await fetch(`https://rockbot.pixis.com.ua/index.php?save_links=1&results=${encodeURIComponent(JSON.stringify({
        group,
        album,
        results
    }))}`, { method: "POST" }).catch(console.log);
    console.log(`👮 POST results to 'rockbot.pixis.com.ua'`);
}

async function saveToCache(resource, group, album) {
    if (!resource.link) return;
    const existing = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `${resource.source} | ${group} | ${album}` });
    if (!existing) {
        await global.MONGO_COLLECTION_PARSER.insertOne({
            ...resource,
            _id: `${resource.source} | ${group} | ${album}`
        });
        console.log(`🌼 MONGO DB | SAVED: [${resource.source} | ${group} | ${album}]`);
    }
}

async function runParsers(sources, browser, group, album) {
    const results = await Promise.all(sources.map(source => PARSERS[source](browser, group, album)));
    return results.filter(Boolean);
}

module.exports = async function (req, res) {
    const resources = req.query.q ? req.query.q.toLowerCase().split(',').filter(s => ALL_SOURCES.includes(s)) : [];
    const callback = req.query.callback;

    if (browser) {
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

    const timerLabel = `👮 TIME FIND ALBUM | ${group} - ${album} | ${resources.join(',')} | ${Date.now()}`;
    console.time(timerLabel);

    // Phase 1: check cache
    const cachedResults = {};
    const sourcesToFetch = [];

    for (const source of requestedSources) {
        const cached = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `${source} | ${group} | ${album}` });
        const isValid = cached && !cached.link.includes('search?');
        if (isValid) {
            console.log(`🌼 MONGO DB | ${source.toUpperCase()} PARSER: return prev result...`);
            cachedResults[source] = cached;
        } else {
            sourcesToFetch.push(source);
        }
    }

    if (!sourcesToFetch.length) {
        console.log(`👮 FIND ALBUM | all from cache | ${group} - ${album}`);
        console.timeEnd(timerLabel);
        res.send(cachedResults);
        await postCallback(callback, group, album, cachedResults);
        return;
    }

    // Phase 2: API-only sources (no browser needed)
    const apiSources = sourcesToFetch.filter(s => API_SOURCES.has(s));
    const browserSources = sourcesToFetch.filter(s => !API_SOURCES.has(s));

    const apiResults = apiSources.length ? await runParsers(apiSources, null, group, album) : [];
    for (const resource of apiResults) await saveToCache(resource, group, album);

    const intermediateResults = {
        ...cachedResults,
        ...apiResults.reduce((acc, r) => { acc[r.source] = r; return acc; }, {}),
    };

    if (!browserSources.length) {
        console.log(`👮 FIND ALBUM | all from API | ${group} - ${album}`);
        console.timeEnd(timerLabel);
        res.send(intermediateResults);
        await postCallback(callback, group, album, intermediateResults);
        return;
    }

    // Phase 3: browser-based sources
    browser = await setupBrowser();

    try {
        const browserResults = await runParsers(browserSources, browser, group, album);
        for (const resource of browserResults) await saveToCache(resource, group, album);

        const results = {
            ...intermediateResults,
            ...browserResults.reduce((acc, r) => { acc[r.source] = r; return acc; }, {}),
        };

        res.send(results);
        await postCallback(callback, group, album, results);
    } finally {
        if (browser) await browser.close();
        browser = null;
        console.timeEnd(timerLabel);
    }
};
