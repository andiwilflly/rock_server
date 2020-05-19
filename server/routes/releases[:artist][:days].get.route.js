// Parts
const spotifyFindInNewReleases = require('../parts/newReleases/spotify.findInNewReleases');
const spotifyFindInArtistAlbums = require('../parts/newReleases/spotify.findInArtistAlbums');
// Utils
const formatNewReleasesUtil = require('../utils/formatNewReleases.util');


module.exports = async function(req, res) {
    global.LOG.info('/releases/:artist/:days');

    let NEW_RELEASES = { /* [albumName]: {} */ };

    const artistName = req.params.artist;
    const days = req.params.days || 5;

    global.LOG.info('/releases/:artist/:days | start search new releases for', artistName);

    NEW_RELEASES = {
        ...NEW_RELEASES,
        ...formatNewReleasesUtil({ name: artistName }, await spotifyFindInNewReleases(artistName, days))
    };

    // We found new release for current artist
    // if(Object.values(NEW_RELEASES).find(release => release.artist === artistName)) return res.send(NEW_RELEASES);

    NEW_RELEASES = {
        ...NEW_RELEASES,
        ...formatNewReleasesUtil({ name: artistName }, await spotifyFindInArtistAlbums(artistName, days))
    };

    res.send(NEW_RELEASES);
}