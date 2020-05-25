const cron = require('node-cron');
const admin = require("firebase-admin");
const request = require('request');
const firebase = require('firebase');
// Parts
const searchAlbumYouTube = require('./youtube/searchAlbum.youtube.api');
const lastFmParser = require('../../@parsers/last.fm.parser');
const yandexParser = require('../../@parsers/yandex.parser');


module.exports = async function(NEW_RELEASES = {}) {
    const DB = firebase.firestore();

    global.LOG.info('SENDER | RECEIVE: releases ', Object.keys(NEW_RELEASES));

    for(const newRelease of Object.values(NEW_RELEASES)) {

        // let apple = await fetch(`${global.BASE_URL}/find/${encodeURIComponent(newRelease.artist)}/${encodeURIComponent(newRelease.name)}?q=apple`);
        // apple = await apple.json();
        // global.LOG.info('SENDER | RECEIVE: fetching:apple...', apple[0]);

        let youtube = await searchAlbumYouTube(newRelease.artist, newRelease.name);
        let lastFm = await lastFmParser(newRelease.artist, newRelease.name);
        let yandex = await yandexParser(newRelease.artist, newRelease.name);

        // let lastfm = await fetch(`${global.BASE_URL}/find/${encodeURIComponent(newRelease.artist)}/${encodeURIComponent(newRelease.name)}?q=lastfm`);
        // lastfm = await lastfm.json();
        // global.LOG.info('SENDER | RECEIVE: fetching:lastfm...', lastfm[0]);
        //
        // let google = await fetch(`${global.BASE_URL}/find/${encodeURIComponent(newRelease.artist)}/${encodeURIComponent(newRelease.name)}?q=google`);
        // google = await google.json();
        // global.LOG.info('SENDER | RECEIVE: fetching:google...', google[0]);
        //
        // let soundcloud = await fetch(`${global.BASE_URL}/find/${encodeURIComponent(newRelease.artist)}/${encodeURIComponent(newRelease.name)}?q=soundcloud`);
        // soundcloud = await soundcloud.json();
        // global.LOG.info('SENDER | RECEIVE: fetching:soundcloud...', soundcloud[0]);
        //
        // let yandex = await fetch(`${global.BASE_URL}/find/${encodeURIComponent(newRelease.artist)}/${encodeURIComponent(newRelease.name)}?q=yandex`);
        // yandex = await yandex.json();
        // global.LOG.info('SENDER | RECEIVE: fetching:yandex...', yandex[0]);

        await DB.collection('notifications')
            .doc(newRelease.name)
            .set({
                ...newRelease,
                links: {
                    spotify: newRelease.spotifyLink,
                    // apple: apple[0].link || '',
                    youtube,
                    lastFm,
                    yandex,
                    // lastfm: lastfm[0].link || '',
                    // google: google[0].link || '',
                    // soundcloud: soundcloud[0].link  || '',
                    // yandex: yandex[0].link || ''
                }
            })
            .then(function() {
                console.log("Document successfully written! TOPIC: ", newRelease.user);

                const message = {
                    notification: {
                        title: 'New release!',
                        body: `${newRelease.artist} - ${newRelease.name}`
                    },
                    topic: newRelease.user
                };


                // Send a message to the device corresponding to the provided
                // registration token.
                admin.messaging().send(message)
                    .then((response) => {
                        // Response is a message ID string.
                        console.log('Successfully sent message:', response);
                    })
                    .catch((error) => {
                        console.log('Error sending message:', error);
                    });
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
    }
}