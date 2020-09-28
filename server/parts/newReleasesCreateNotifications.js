const admin = require("firebase-admin");
// Utils
const setupBrowser = require('../utils/setupBrowser.utils');
const MongoDBSave = require('../utils/mongoDB/MongoDB.save');
// Parts
const searchAlbumYouTube = require('./youtube/searchAlbum.youtube.api');
const lastFmParser = require('../../@parsers/last.fm.parser');
const yandexParser = require('../../@parsers/yandex.parser');
const soundcloudParser = require('../../@parsers/soundcloud.parser');
const googleParser = require('../../@parsers/google.parser');
const appleParser = require('../../@parsers/apple.parser');


module.exports = async function(NEW_RELEASES = {}) {
    global.LOG.info('SENDER | RECEIVE: releases ', Object.keys(NEW_RELEASES));

    const browser = await setupBrowser();

    const notifications = await global[`MONGO_COLLECTION_NOTIFICATIONS`].find().toArray();

    const newReleases = Object.values(NEW_RELEASES).filter(release => !notifications.find(n => n.id === release.id));

    console.log(newReleases, 'newReleases');
    for(const newRelease of newReleases) {

        // let apple = await fetch(`${global.BASE_URL}/find/${encodeURIComponent(newRelease.artist)}/${encodeURIComponent(newRelease.name)}?q=apple`);
        // apple = await apple.json();
        // global.LOG.info('SENDER | RECEIVE: fetching:apple...', apple[0]);

        const group = newRelease.artist.toLowerCase().trim();
        const album = newRelease.name.toLowerCase().trim();

        // let youtube = await searchAlbumYouTube(group, album);
        // let lastfm = await lastFmParser(browser, group, album);
        // let yandex = await yandexParser(browser, group, album);
        // let soundcloud = await soundcloudParser(browser, group, album);
        // let google = await googleParser(browser, group, album);
        // let apple = await appleParser(browser, group, album);

        try {
            await MongoDBSave('notifications', global[`MONGO_COLLECTION_NOTIFICATIONS`], {
                _id: newRelease.id,
                uid: newRelease.subscription.uid,
                ...newRelease,
                links: {
                    spotify: {
                        link: newRelease.spotifyLink
                    },
                    // youtube,
                    // lastfm,
                    // yandex,
                    // soundcloud,
                    // google,
                    // apple
                }
            });
            console.log("Document successfully written! TOPIC: ", newRelease.subscription.uid);

            const message = {
                notification: {
                    title: 'New release!',
                    body: `${newRelease.artist} - ${newRelease.name}`
                },
                topic: newRelease.subscription.uid
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
        } catch(e) {
            console.log('ERROR | ' + e);
        }
    }

    await browser.close();
}