// Parts
const spotifyFindInNewReleases = require('../parts/newReleases/spotify.findInNewReleases');
const spotifyFindInArtistAlbums = require('../parts/newReleases/spotify.findInArtistAlbums');
const lastFmFindInArtistAlbums = require('../parts/newReleases/lastfm.findInArtistAlbums');
const newReleasesCreateNotifications = require('../parts/newReleasesCreateNotifications');
// Utils
const formatNewReleasesUtil = require('../utils/formatNewReleases.util');


const sleep = (time = 1000)=> new Promise((resolve)=> setTimeout(resolve, time));


module.exports = async function(req, res) {
    global.LOG.info('/releases/:days');

    let NEW_RELEASES = { /* [albumName]: {} */ };

    const days = req.params.days || 5;
    global.LOG.info(`/releases/:days | enter, [:days ${days}]`);

    const subscriptions = await global[`MONGO_COLLECTION_SUBSCRIPTIONS`].find().toArray();
    console.log('APP [subscriptions] loaded...', subscriptions.length);

    global.LOG.info('/releases/:days | [subscriptions] loaded: ', subscriptions.length);

    for(const subscription of subscriptions) {
        await sleep(500);
        const releases = await spotifyFindInArtistAlbums(subscription.name, days);
        NEW_RELEASES = {
            ...NEW_RELEASES,
            ...formatNewReleasesUtil(subscription, releases)
        };

        // We found new release for current artist
        // if(Object.values(NEW_RELEASES).find(release => {
        //     return release.artist === subscription.name && release.user === subscription.user
        // })) continue;

        // NEW_RELEASES = {
        //     ...NEW_RELEASES,
        //     ...formatNewReleasesUtil(subscription, await spotifyFindInNewReleases(subscription.name, days))
        // };

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