module.exports = async function getArtistId(artistName = '', spotifyToken) {

    let artist = await fetch(`https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(artistName)}`, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
    });
    artist = await artist.json();

    if(artist.error) {
        global.LOG.error('spotify | findInNewReleases ERROR:', artist.error);
        return null;
    }

    return  artist.artists.items;
}