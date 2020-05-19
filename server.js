const fs = require('fs');
const request = require('request');
const firebase = require('firebase');
const express = require('express');
// Logger
try {  fs.unlinkSync('./server/project.log'); } catch(err) { console.error(err); }
global.LOG = require('simple-node-logger').createSimpleLogger('./server/project.log');
// Parts
require('./server/cron');
require('./server/parts/initializeFirebase');
const spotifyFindInNewReleases = require('./server/parts/newReleases/spotify.findInNewReleases');
const spotifyFindInArtistAlbums = require('./server/parts/newReleases/spotify.findInArtistAlbums');
// Utils
const formatNewReleasesUtil = require('./server/utils/formatNewReleases.util');
// Routes
const findGroupAlbumRoute = require('./server/routes/find[group][album].get.route');


const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        Authorization:
            'Basic ' +
            new Buffer('33607ef442574fad9b2dc7c9cf21a5cd' + ':' + '165ea32793f747b0a0ceed2d7a6ec240').toString('base64')
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

request.post(authOptions, function(error, response, body) {
    global.SPOTIFY_TOKEN = body.access_token;

    global.LOG.info('Fetched SPOTIFY_TOKEN:', global.SPOTIFY_TOKEN);

    const app = express();

    app.get('/', function (req, res) {
        res.send('Hello World!');
    });

    app.get('/newReleases/:days', async function (req, res) {
        let NEW_RELEASES = { /* [albumName]: {} */ };

        const days = req.params.days;
        global.LOG.info(`/newReleases/:days | enter, [:days ${days}]`);

        const DB = firebase.firestore();
        const subscriptionsDB = DB.collection("subscriptions");
        let subscriptions = await subscriptionsDB.get();
        subscriptions = subscriptions.docs.map(doc => doc.data());
        global.LOG.info('/newReleases/:days | [subscriptions] loaded: ', subscriptions.length);

        for(const subscription of subscriptions) {
            global.LOG.info('/newReleases/:days | [subscription] start search new releases...', subscription);

            NEW_RELEASES = {
                ...NEW_RELEASES,
                ...formatNewReleasesUtil(subscription, await spotifyFindInNewReleases(subscription.name, days))
            };

            // We found new release for current artist
            if(Object.values(NEW_RELEASES).find(release => release.artist === subscription.name)) continue;

            NEW_RELEASES = {
                ...NEW_RELEASES,
                ...formatNewReleasesUtil(subscription, await spotifyFindInArtistAlbums(subscription.name, days))
            };
        }

        res.send(NEW_RELEASES);
    });

    app.get('/newReleases/:artistName/:days', function (req, res) {
        // newReleases(res);
    });


// https://www.spotify.com/
// https://www.deezer.com/
    app.get('/find/:group/:album', findGroupAlbumRoute);

    app.listen(process.env.PORT || 3000, function() {
        global.LOG.info('Example app listening on port 3000!');
    });
});
