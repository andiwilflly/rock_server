const firebase = require('firebase');
// Parts
const spotifyFindInNewReleases = require('../parts/newReleases/spotify.findInNewReleases');
const spotifyFindInArtistAlbums = require('../parts/newReleases/spotify.findInArtistAlbums');
// Utils
const formatNewReleasesUtil = require('../utils/formatNewReleases.util');


module.exports = async function(req, res) {
    let NEW_RELEASES = { /* [albumName]: {} */ };

    const days = req.params.days;
    global.LOG.info(`/releases/:days | enter, [:days ${days}]`);

    const DB = firebase.firestore();
    const subscriptionsDB = DB.collection("subscriptions");
    let subscriptions = await subscriptionsDB.get();
    subscriptions = subscriptions.docs.map(doc => doc.data());
    global.LOG.info('/releases/:days | [subscriptions] loaded: ', subscriptions.length);

    for(const subscription of subscriptions) {
        global.LOG.info('/releases/:days | [subscription] start search new releases...', subscription);

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
}