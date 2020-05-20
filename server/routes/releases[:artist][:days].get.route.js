// Parts
const spotifyFindInNewReleases = require('../parts/newReleases/spotify.findInNewReleases');
const spotifyFindInArtistAlbums = require('../parts/newReleases/spotify.findInArtistAlbums');
const lastFmFindInArtistAlbums = require('../parts/newReleases/lastfm.findInArtistAlbums');
const newReleasesCreateNotifications = require('../parts/newReleasesCreateNotifications');
// Utils
const formatNewReleasesUtil = require('../utils/formatNewReleases.util');


module.exports = async function(req, res) {
    global.LOG.info('/releases/:artist/:days');

    let NEW_RELEASES = { /* [albumName]: {} */ };

    const artistName = req.params.artist;
    const days = req.params.days || 5;
    const userId = req.params.uid || null;

    global.LOG.info('/releases/:artist/:days | start search new releases for: ', artistName, days, userId);

    NEW_RELEASES = {
        ...NEW_RELEASES,
        ...formatNewReleasesUtil({ name: artistName, user: userId }, await spotifyFindInNewReleases(artistName, days))
    };

    // We found new release for current artist
    // if(Object.values(NEW_RELEASES).find(release => release.artist === artistName)) return res.send(NEW_RELEASES);

    NEW_RELEASES = {
        ...NEW_RELEASES,
        ...formatNewReleasesUtil({ name: artistName, user: userId }, await spotifyFindInArtistAlbums(artistName, days))
    };


    // NEW_RELEASES = {
    //     ...NEW_RELEASES,
    //     ...formatNewReleasesUtil({ name: artistName }, await lastFmFindInArtistAlbums(artistName, days))
    // };

    if(userId) newReleasesCreateNotifications(NEW_RELEASES); // Called with userId - need to update [notifications] for this user

    res.send(NEW_RELEASES);
}