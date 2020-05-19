// Utils
const spotifyGetArtistId = require('../../utils/spotify.getArtistId.util');
const daysFromNowUtil = require('../../utils/daysFromNow.util');


async function spotifyFindInArtistAlbums(artistName = '', days= 5, spotifyToken = '') {
    let NEW_RELEASES = { /* [albumName]: {} */ };

    global.LOG.info('spotify | findInArtistAlbums START: artist -> ', artistName);


    // 1. We need to get our [artist] spotify [id]
    const artistId = await spotifyGetArtistId(artistName, spotifyToken);
    global.LOG.info('spotify | findInArtistAlbums FOUND: artistId ', artistId);


    // 2. Find all [albums] of current [artistName] on spotify
    let albums = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=50`, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
    });
    albums = await albums.json();

    if(albums.error) {
        global.LOG.error('spotify | findInArtistAlbums ERROR: artists ', albums.error);
        return {};
    }


    // 3. Fetch each [albums] info and try to find [new] albums
    const albumsId = encodeURIComponent(albums.items.map(album => album.id).join(','));
    let albumsInfo = await fetch(`https://api.spotify.com/v1/albums?ids=${albumsId}`, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
    });
    albumsInfo = await albumsInfo.json();
    if(albumsInfo.error) {
        global.LOG.error('spotify | findInArtistAlbums ERROR: albumsInfo ', albumsInfo.error);
        return {};
    }
    albumsInfo = albumsInfo.albums.filter(Boolean);

    albumsInfo.forEach(albumInfo => {
        const daysFromNow = daysFromNowUtil(albumInfo.release_date);
        if(daysFromNow < days) NEW_RELEASES[albumInfo.name] = albumInfo;
    });

    return NEW_RELEASES;
}


module.exports = spotifyFindInArtistAlbums;