const fetch = require("node-fetch");
const daysFromNowUtil = require('../../utils/daysFromNow.util');


module.exports = async function(artistName = '', days = 1) {
	let NEW_RELEASES = {};

	let albums = await fetch(`http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artistName)}&limit=100&api_key=8ecb1efa682d2b9fb834f9e757e4fc0b&format=json`);
	albums = await albums.json();

	global.LOG.info(`lastFm | findInArtistAlbums SUCCESS: albums found [${albums.topalbums.album.length}] of [${artistName}]`);

	for(const album of albums.topalbums.album) {
		let spotifyAlbum = await fetch(`https://api.spotify.com/v1/search?type=album&q=${encodeURIComponent(album.name)}`, {
			headers: { 'Authorization': `Bearer ${global.SPOTIFY_TOKEN}` }
		});
		spotifyAlbum = await spotifyAlbum.json();

		if(spotifyAlbum.error) {
			global.LOG.error('lastFm | findInArtistAlbums ERROR: search ', spotifyAlbum.error);
			return {};
		}

		if(!spotifyAlbum.albums.items[0]) continue;

		const daysFromNow = daysFromNowUtil(spotifyAlbum.albums.items[0].release_date);
		if(daysFromNow < days) global.LOG.info(`lastFm | findInArtistAlbums FOUND ALBUM: [${album.name}] of [${artistName}]`);
		if(daysFromNow < days) NEW_RELEASES[album.name] = spotifyAlbum.albums.items[0];
	}

	return NEW_RELEASES;
}
