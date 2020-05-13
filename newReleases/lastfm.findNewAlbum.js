async function findNewAlbum(subscription, spotifyToken) {
	let NEW_RELEASES = {};


	let albums = await fetch(`http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(subscription.name)}&limit=100&api_key=8ecb1efa682d2b9fb834f9e757e4fc0b&format=json`);
	albums = await albums.json();


	await Promise.all(albums.topalbums.album.map(album => {
		return new Promise(async resolve => {

			// let albumInfo = await fetch(`http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=8ecb1efa682d2b9fb834f9e757e4fc0b&artist=${encodeURIComponent(subscription.name)}&album=${encodeURIComponent(album.name)}&format=json`);
			// albumInfo = await albumInfo.json();

			//if(albumInfo.album.wiki) console.log(albumInfo.album.wiki.published, album.name);

			let spotifyAlbum = await fetch(`https://api.spotify.com/v1/search?type=album&q=${encodeURIComponent(album.name)}`, {
				headers: {
					'Authorization': `Bearer ${spotifyToken}`
				}
			});
			spotifyAlbum = await spotifyAlbum.json();

			resolve(spotifyAlbum);
		});
	})).then(spotifyAlbums => {
		spotifyAlbums.forEach(spotifyAlbum => {

			if(!spotifyAlbum.albums || !spotifyAlbum.albums.items[0]) return;

			const daysFromNow = (Date.now() - (new Date(spotifyAlbum.albums.items[0].release_date)).getTime()) / 1000 / 60 / 60 / 24;

			if(daysFromNow < 1) NEW_RELEASES[spotifyAlbum.name] = {
				...spotifyAlbum.albums.items[0],
				user: subscription.user,
				artist: subscription.name,
				isActive: true
			};
		});
	});

	return NEW_RELEASES;
}


module.exports = findNewAlbum;
