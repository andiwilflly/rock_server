const request = require('request');
const admin = require("firebase-admin");
const firebase = require('firebase');
require('firebase/firestore');
const spotifyFindNewAlbum = require('./spotify.findNewAlbum');
const lastfmFindNewAlbum = require('./lastfm.findNewAlbum');


// Aversions Crown - Born in the Gutter
async function init(spotifyToken = '', res) {
	let NEW_RELEASES = {};

	const DB = firebase.firestore();
	console.log('APP firestore ready...');
	const subscriptionsDB = DB.collection("subscriptions");
	console.log('APP [subscriptions] collection ready...');


	let subscriptions = await subscriptionsDB.get();
	subscriptions = subscriptions.docs.map(doc => doc.data());

	if(!subscriptions.length) return; // TODO


	console.log('APP [subscriptions] loaded...');

	// Trying to find spotify [artist] -> [albums] list + spotify [new releases]
	for(const subscription of subscriptions) {

		console.log('[subscription] ', subscription);

		NEW_RELEASES = { ...NEW_RELEASES, ...await spotifyFindNewAlbum(subscription, spotifyToken) };

		if(Object.values(NEW_RELEASES).find(release => release.artist === subscription.name)) continue; // We found new release for current artist

		NEW_RELEASES = { ...NEW_RELEASES, ...await lastfmFindNewAlbum(subscription, spotifyToken) };
	}


	// Save to DB
	for(const newRelease of Object.values(NEW_RELEASES)) {
		await new Promise(resolve => {

			DB.collection('notifications').doc(newRelease.name).set({
				artists: newRelease.artists,
				image: newRelease.images[0].url,
				name: newRelease.name,
				artist: newRelease.artist,
				id: newRelease.id,
				type: newRelease.type,
				releaseDate: newRelease.release_date,
				spotifyLink: newRelease.external_urls.spotify,
				isActive: true,
				user: newRelease.user
			})
				.then(function() {
					console.log("Document successfully written!");
					resolve();
				})
				.catch(function(error) {
					console.error("Error writing document: ", error);
					resolve()
				});
		})
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


	// var message = {
	// 	notification: {
	// 		title: '850',
	// 		body: '2:45'
	// 	},
	// 	topic: 'allDevices',
	// 	// token: 'c39MY4pPQ96tVZoSHqHWXF:APA91bHGGN-1_5TmUU34ez1zmoZpA0bJ_B5nVcAztCF6T5XTSP5OExycR5x2MpugUHgA40AHvm619UqFKcAb1sMRH-U8rryLGayGjgDIlcNsmYi4iHARKy9AUAVF8dMnORT2ShMTctF0'
	// 	// token: 'ftYUwBbyR8udEhZuninBLH:APA91bHvGDFAw4KSoBPVfzlWScGkJOrnA4FevYf_6K6u30Hkp3jUkdgkAFxMoBVt9nbytK8NP9wfo89bTC5p5n_IAah6sH8HCm9O6F8gk9jMfeneHF2Ht0fJ4GNPE0Yz9aVx_rpynt-k'
	// };
	//
	// // Send a message to the device corresponding to the provided
	// // registration token.
	// admin.messaging().send(message)
	// 	.then((response) => {
	// 		// Response is a message ID string.
	// 		console.log('Successfully sent message:', response);
	// 	})
	// 	.catch((error) => {
	// 		console.log('Error sending message:', error);
	// 	});
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