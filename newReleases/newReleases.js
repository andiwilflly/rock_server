const request = require('request');
require('firebase/firestore');
const spotifyFindNewAlbum = require('./spotify.findNewAlbum');
const lastfmFindNewAlbum = require('./lastfm.findNewAlbum');
// Utils
const MongoDBSave = require('../server/utils/mongoDB/MongoDB.save');


// Aversions Crown - Born in the Gutter
async function init(spotifyToken = '', res) {
	let NEW_RELEASES = {};

	console.log('APP firestore ready...');
	console.log('APP [subscriptions] collection ready...');

	const subscriptions = await global[`MONGO_COLLECTION_SUBSCRIPTIONS`].find().toArray();
	console.log('APP [subscriptions] loaded...', subscriptions.length);

	if(!subscriptions.length) return; // TODO


	// Trying to find spotify [artist] -> [albums] list + spotify [new releases]
	for(const subscription of subscriptions) {

		console.log('[subscription] ', subscription);

		NEW_RELEASES = { ...NEW_RELEASES, ...await spotifyFindNewAlbum(subscription, spotifyToken) };

		if(Object.values(NEW_RELEASES).find(release => release.artist === subscription.name)) continue; // We found new release for current artist

		NEW_RELEASES = { ...NEW_RELEASES, ...await lastfmFindNewAlbum(subscription, spotifyToken) };
	}


	// Save to DB
	for(const newRelease of Object.values(NEW_RELEASES)) {
		try {
			await MongoDBSave('subscriptions', global[`MONGO_COLLECTION_SUBSCRIPTIONS`], {
				_id: newRelease.id,
				artists: newRelease.artists,
				image: newRelease.images[0].url,
				name: newRelease.name,
				artist: newRelease.artist,
				type: newRelease.type,
				releaseDate: newRelease.release_date,
				spotifyLink: newRelease.external_urls.spotify,
				isActive: true,
				user: newRelease.user,
				uid: newRelease.uid
			});
			console.log("Document successfully written!");
		} catch(e) {
			console.error("Error writing document: " + e);
		}
	}


	console.log('FOUND NEW ALBUMS: ', Object.values(NEW_RELEASES).map(album => ({
		name: album.name,
		artist: album.artist,
		albumType: album.album_type,
		releaseDate: album.release_date
	})));

	res.send(Object.values(NEW_RELEASES).map(album => ({
		name: album.name,
		albumType: album.album_type,
		releaseDate: album.release_date
	})));
}


const authOptions = {
	url: 'https://accounts.spotify.com/api/token',
	headers: {
		Authorization:
			'Basic ' +
			new Buffer('33607ef442574fad9b2dc7c9cf21a5cd' + ':' + '165ea32793f747b0a0ceed2d7a6ec240').toString('base64')
	},
	form: {
		grant_type: 'client_credentials'
	},
	json: true
};


module.exports = async function(res) {
	request.post(authOptions, function(error, response, body) {
		init(body.access_token, res);
	});
}