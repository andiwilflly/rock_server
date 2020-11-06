const fetch = require("node-fetch");


async function findNewAlbum(subscription, spotifyToken) {
	let NEW_RELEASES = {};

	let artist = await fetch(`https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(subscription.name)}`, {
		headers: {
			'Authorization': `Bearer ${spotifyToken}`
		}
	});
	artist = await artist.json();

	console.log('===>', artist);

	const artistId = artist.artists.items ? artist.artists.items[0].id : '';

	console.log('getting spotify artist albums...', artistId);


	// =====


	let newReleases = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=50`, {
		headers: {
			'Authorization': `Bearer ${spotifyToken}`
		}
	});
	newReleases = await newReleases.json();

	let newReleases2 = await fetch(`https://api.spotify.com/v1/browse/new-releases?offset=50&limit=50`, {
		headers: {
			'Authorization': `Bearer ${spotifyToken}`
		}
	});
	newReleases2 = await newReleases2.json();

	[ ...newReleases.albums.items, ...newReleases2.albums.items ].forEach(album => {
		const currentArtist = album.artists.find(artist => artist.id === artistId);

		if(!currentArtist) return; // Can`t find artist in [new releases] list
		const daysFromNow = (Date.now() - (new Date(album.release_date)).getTime()) / 1000 / 60 / 60 / 24;

		console.log('NEW release found...', subscription.name, daysFromNow);

		if(daysFromNow < 5) NEW_RELEASES[album.name] = {
			...album,
			artist: subscription.name,
			user: subscription.user,
			isActive: true };
	});

	if(Object.keys(NEW_RELEASES).length) return NEW_RELEASES; // No sense to search more. Could be only one new album at once


	// =====

	let albums = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=50`, {
		headers: {
			'Authorization': `Bearer ${spotifyToken}`
		}
	});
	albums = await albums.json();


	for(const album of albums.items) {
		let albumInfo = await fetch(`https://api.spotify.com/v1/albums/${album.id}`, {
			headers: {
				'Authorization': `Bearer ${spotifyToken}`
			}
		});
		albumInfo = await albumInfo.json();

		const daysFromNow = (Date.now() - (new Date(albumInfo.release_date)).getTime()) / 1000 / 60 / 60 / 24;

		if(daysFromNow < 5) NEW_RELEASES[albumInfo.name] = {
			...albumInfo,
			user: subscription.user,
			artist: subscription.name,
			isActive: true
		};
	}

	return NEW_RELEASES;
}


module.exports = findNewAlbum;
