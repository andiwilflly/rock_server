// Utils
const spotifyGetArtistId = require('../../utils/spotify.getArtistId.util');
const daysFromNowUtil = require('../../utils/daysFromNow.util');


async function spotifyFindInNewReleases(artistName = '', days= 5) {
    let NEW_RELEASES = { /* [albumName]: {} */ };

    global.LOG.info('spotify | findInNewReleases START: artist -> ', artistName);


    // 1. We need to get our [artist] spotify [id]
    const artistId = await spotifyGetArtistId(artistName, global.SPOTIFY_TOKEN);

    // 2. We need to fetch all (100) new releases from spotify
    let newReleases1 = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=50`, {
        headers: {'Authorization': `Bearer ${global.SPOTIFY_TOKEN}` }
    });
    let newReleases2 = await fetch(`https://api.spotify.com/v1/browse/new-releases?offset=50&limit=50`, {
        headers: { 'Authorization': `Bearer ${global.SPOTIFY_TOKEN}` }
    });
    newReleases1 = await newReleases1.json();
    newReleases2 = await newReleases2.json();
    const newReleases = [ ...newReleases1.albums.items, ...newReleases2.albums.items ];
    global.LOG.info('spotify | findInNewReleases FETCHED: newReleases ', newReleases.length);


    // 3. Try to find artist with [artistId] in these [newReleases]
    newReleases.forEach(album => {
        const currentArtist = album.artists.find(artist => artist.id === artistId);

        if(!currentArtist) return; // Can`t find artist in [new releases] list
        const daysFromNow = daysFromNowUtil(album.release_date);

        if(daysFromNow < days) global.LOG.info('spotify | findInNewReleases FOUND: new release ', artistName, daysFromNow);
        if(daysFromNow < days) NEW_RELEASES[album.name] = album;
    });

    return NEW_RELEASES;
}


module.exports = spotifyFindInNewReleases;