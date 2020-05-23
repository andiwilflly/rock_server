const firebase = require('firebase');
// Parts
const spotifyFindInNewReleases = require('../parts/newReleases/spotify.findInNewReleases');
const spotifyFindInArtistAlbums = require('../parts/newReleases/spotify.findInArtistAlbums');
const lastFmFindInArtistAlbums = require('../parts/newReleases/lastfm.findInArtistAlbums');
const newReleasesCreateNotifications = require('../parts/newReleasesCreateNotifications');
// Utils
const formatNewReleasesUtil = require('../utils/formatNewReleases.util');


module.exports = async function(req, res) {
    global.LOG.info('/releases/:days');

    let NEW_RELEASES = { /* [albumName]: {} */ };

    const days = req.params.days || 5;
    global.LOG.info(`/releases/:days | enter, [:days ${days}]`);

    const DB = firebase.firestore();
    const subscriptionsDB = DB.collection("subscriptions");
    let subscriptions = await subscriptionsDB.get();
    subscriptions = subscriptions.docs.map(doc => doc.data());
    global.LOG.info('/releases/:days | [subscriptions] loaded: ', subscriptions.length);

    for(const subscription of subscriptions) {
        //global.LOG.info('/releases/:days | [subscription] start search new releases...', subscription);

        NEW_RELEASES = {
            ...NEW_RELEASES,
            ...formatNewReleasesUtil(subscription, await spotifyFindInArtistAlbums(subscription.name, days))
        };

        // We found new release for current artist
        if(Object.values(NEW_RELEASES).find(release => {
            return release.artist === subscription.name && release.user === subscription.user
        })) continue;

        NEW_RELEASES = {
            ...NEW_RELEASES,
            ...formatNewReleasesUtil(subscription, await spotifyFindInNewReleases(subscription.name, days))
        };

        // if(Object.values(NEW_RELEASES).find(release => {
        //     return release.artist === subscription.name && release.user === subscription.user
        // })) continue;

        // NEW_RELEASES = {
        //     ...NEW_RELEASES,
        //     ...formatNewReleasesUtil(subscription, await lastFmFindInArtistAlbums(subscription.name, days))
        // };
    }

    // Start process in sync way because we need fast response from server
    newReleasesCreateNotifications(NEW_RELEASES);

    res.send(NEW_RELEASES);
}