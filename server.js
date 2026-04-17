// unused: const fs = require('fs');
// unused: const admin = require("firebase-admin");
const cors = require('cors');
const express = require('express');
// Logger
// unused: try {  fs.unlinkSync('./server/project.log'); } catch(err) { if (err.code !== 'ENOENT') console.error(err); }
// unused: global.LOG = require('simple-node-logger').createSimpleLogger('./server/project.log');
global.LOG = { info: console.log, error: console.error };
// Utils
// unused: require('./server/utils/extendJs.utils');
// DB
const connectMongoDB = require('./server/utils/mongoDB/MongoDB.connect');
// Routes
// unused: const releasesDaysRoute = require('./server/routes/releases[days].get.route');
// unused: const releasesArtistDaysRoute = require('./server/routes/releases[artist][days].get.route');
const findGroupAlbumRoute = require('./server/routes/find[group][album].get.route');
// unused: const FCMSubscribe = require('./server/routes/FCM/fcm.subscribe[token][topic]route');
// unused: const FCMUnsubscribe = require('./server/routes/FCM/fcm.unsubscribe[token][topic]route');
// unused: const mongoSaveCollection = require('./server/routes/mongo/post.mongo.save[collection].route');
// unused: const mongoDeleteCollection = require('./server/routes/mongo/post.mongo.delete[collection][_id].route');
// unused: const mongoGetCollection = require('./server/routes/mongo/mongo.get[collection][uid].route');
// unused: const mongoRemoveCollection = require('./server/routes/mongo/mongo.remove[collection][uid].route');
// const sokkerPlayer = require('./server/routes/sokker/player[id].get.route');
// const sokkerTeam = require('./server/routes/sokker/team[id].get.route');
// unused: const findConcerts = require('./server/routes/concerts[artist].get.route');
//const usersDocsList = require('./server/routes/study-ua/usersDocsList.get.route');



//global.SSE = new SSE(['initialize']);
// unused: global.SPOTIFY_TOKEN = null;
// unused: global.BASE_URL = 'https://newrockbot.herokuapp.com';
// unused: global.YOUTUBE_API = 'AIzaSyDwtT9D89yM6-MOo7AkYX3D2Zz4r0Hr-bI';

// unused: global.authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//         Authorization:
//             'Basic ' +
//             Buffer.from('33607ef442574fad9b2dc7c9cf21a5cd' + ':' + '165ea32793f747b0a0ceed2d7a6ec240').toString('base64')
//     },
//     form: {
//         grant_type: 'client_credentials'
//     },
//     json: true
// };

// unused: let spotifyTokenLifetime = 0;

const app = express();

app.use(cors());

app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async function (req, res, next) {

    if(!global.MONGO_CLIENT) {
        global.MONGO_CLIENT = await connectMongoDB();
        global.MONGO_DB = await global.MONGO_CLIENT.db('instaGQL-database');
        let parserCollection = await global.MONGO_DB.collection('parser');
        if(!parserCollection) await global.MONGO_DB.createCollection('parser');
        global.MONGO_COLLECTION_PARSER = await global.MONGO_DB.collection('parser');

        // unused: let notificationsCollection = await global.MONGO_DB.collection('notifications');
        // unused: if(!notificationsCollection) await global.MONGO_DB.createCollection('notifications');
        // unused: global.MONGO_COLLECTION_NOTIFICATIONS = await global.MONGO_DB.collection('notifications');

        // unused: let subscriptionsCollection = await global.MONGO_DB.collection('subscriptions');
        // unused: if(!subscriptionsCollection) await global.MONGO_DB.createCollection('subscriptions');
        // unused: global.MONGO_COLLECTION_SUBSCRIPTIONS = await global.MONGO_DB.collection('subscriptions');

        // Sending data to each connected SSE client
        // unused: console.error(`SERVER | SSE: start polling data to client...`);
        // global.SSE.send(JSON.stringify({
        //     notifications: await global[`MONGO_COLLECTION_NOTIFICATIONS`].find().toArray(),
        //     subscriptions: await global[`MONGO_COLLECTION_SUBSCRIPTIONS`].find().toArray()
        // }));
        // setInterval(async ()=> {
        //     global.SSE.send(JSON.stringify([{
        //         notifications: await global[`MONGO_COLLECTION_NOTIFICATIONS`].find().toArray(),
        //         subscriptions: await global[`MONGO_COLLECTION_SUBSCRIPTIONS`].find().toArray()
        //     }]));
        // }, 60000); // 1 min
    }

    // unused: 1hr spotify token lifetime
    // if(Date.now() - spotifyTokenLifetime > 3500000) {
    //     const response = await fetch(global.authOptions.url, {
    //         method: 'POST',
    //         headers: global.authOptions.headers,
    //         body: new URLSearchParams(global.authOptions.form)
    //     });
    //     const body = await response.json();
    //     spotifyTokenLifetime = Date.now();
    //     global.LOG.info('SERVER | Get [spotify] token');
    //     global.SPOTIFY_TOKEN = body.access_token;
    //     next();
    // } else {
    //     global.LOG.info('SERVER | Get cached [spotify] token: ' + ((Date.now() - spotifyTokenLifetime) / 1000 / 60 / 24).toFixed(3) + ' hr');
    //     next();
    // }
    next();
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broken!');
});


// unused: app.get('/send', async (req, res)=> {
//
//     const message = {
//         notification: {
//             title: 'TEST release!',
//             body: 'TEST'
//         },
//         topic: 'test' // 'allDevices'
//     };
//
//     // Send a message to the device corresponding to the provided
//     // registration token.
//     // admin.messaging().send(message)
//     //     .then((response) => {
//     //         // Response is a message ID string.
//     //         console.log('Successfully sent message:', response);
//     //         // res.send('Hello World!');
//     //     })
//     //     .catch((error) => {
//     //         console.log('Error sending message:', error);
//     //     });
//
//     const message2 = {
//         notification: {
//             title: 'New release!',
//             body: '${newRelease.artist} - ${newRelease.name}'
//         },
//         topic: 'JKooKnosrveuLhmbnpdDVAUk6Cp1' // 'allDevices'
//     };
//
//     // Send a message to the device corresponding to the provided
//     // registration token.
//     // admin.messaging().send(message2)
//     //     .then((response) => {
//     //         // Response is a message ID string.
//     //         console.log('Successfully sent message2:', response);
//     //         res.send('sended');
//     //         // res.send('Hello World!');
//     //     })
//     //     .catch((error) => {
//     //         console.log('Error sending message2:', error);
//     //         res.send("Not Hello World!");
//     //     });
// } );


//app.get('/stream', global.SSE.init)
// unused: app.get('/spotify/token', (req, res)=> res.send({ token: global.SPOTIFY_TOKEN }));
// unused: app.get('/releases/:days', releasesDaysRoute);
// unused: app.get('/releases/:artist/:days', releasesArtistDaysRoute);
// unused: app.get('/releases/:artist/:days/:uid', releasesArtistDaysRoute);

// unused: app.get('/concerts/:artist', findConcerts);

// unused: app.get('/fcm/subscribe/:token/:topic', FCMSubscribe)
// unused: app.get('/fcm/unsubscribe/:token/:topic', FCMUnsubscribe)

app.get('/find/:group/:album', findGroupAlbumRoute);

// unused: app.get('/mongo/get/:collection', mongoGetCollection);
// unused: app.get('/mongo/get/:collection/:uid', mongoGetCollection);
// unused: app.post('/mongo/save/:collection', mongoSaveCollection);
// unused: app.post('/mongo/delete/:collection/:_id', mongoDeleteCollection);
// unused: app.get('/mongo/remove/:collection', mongoRemoveCollection);


// unused: app.get(`/queue_bot/redirect`, (req, res)=> {
//     res.redirect(req.query.to);
// });

// // Sokker
// app.get('/sokker/player/:pid', sokkerPlayer);
// app.get('/sokker/team/:teamID', sokkerTeam);

// study-ua
//app.get('/study-ua/users-docs', usersDocsList);


app.listen(process.env.PORT || 3001, function() {
    global.LOG.info(`SERVER app listening on port ${process.env.PORT || 3001}!`);
});
