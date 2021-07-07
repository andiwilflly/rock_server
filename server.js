const fs = require('fs');
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const request = require('request');
const cors = require('cors');
const express = require('express');
// Logger
try {  fs.unlinkSync('./server/project.log'); } catch(err) { console.error(err); }
global.LOG = require('simple-node-logger').createSimpleLogger('./server/project.log');
// Utils
require('./server/utils/extendJs.utils');
// DB
const connectMongoDB = require('./server/utils/mongoDB/MongoDB.connect');
// Routes
const releasesDaysRoute = require('./server/routes/releases[days].get.route');
const releasesArtistDaysRoute = require('./server/routes/releases[artist][days].get.route');
const findGroupAlbumRoute = require('./server/routes/find[group][album].get.route');
const FCMSubscribe = require('./server/routes/FCM/fcm.subscribe[token][topic]route');
const FCMUnsubscribe = require('./server/routes/FCM/fcm.unsubscribe[token][topic]route');
const mongoSaveCollection = require('./server/routes/mongo/post.mongo.save[collection].route');
const mongoDeleteCollection = require('./server/routes/mongo/post.mongo.delete[collection][_id].route');
const mongoGetCollection = require('./server/routes/mongo/mongo.get[collection][uid].route');
const mongoRemoveCollection = require('./server/routes/mongo/mongo.remove[collection][uid].route');
const sokkerPlayer = require('./server/routes/sokker/player[id].get.route');
const sokkerTeam = require('./server/routes/sokker/team[id].get.route');
const findConcerts = require('./server/routes/concerts[artist].get.route');
//const usersDocsList = require('./server/routes/study-ua/usersDocsList.get.route');



//global.SSE = new SSE(['initialize']);
global.SPOTIFY_TOKEN = null;
global.BASE_URL = 'https://newrockbot.herokuapp.com';
global.YOUTUBE_API = 'AIzaSyDwtT9D89yM6-MOo7AkYX3D2Zz4r0Hr-bI';

global.authOptions = {
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

let spotifyTokenLifetime = 0;

const app = express();

app.use(cors());

app.use(express.static('public'))
app.use(bodyParser.json());     // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
    extended: true
}));

app.use(async function (req, res, next) {

    if(!global.MONGO_CLIENT) {
        global.MONGO_CLIENT = await connectMongoDB();
        global.MONGO_DB = await global.MONGO_CLIENT.db('instaGQL-database');
        let parserCollection = await global.MONGO_DB.collection('parser');
        if(!parserCollection) await global.MONGO_DB.createCollection('parser');
        global.MONGO_COLLECTION_PARSER = await global.MONGO_DB.collection('parser');

        let notificationsCollection = await global.MONGO_DB.collection('notifications');
        if(!notificationsCollection) await global.MONGO_DB.createCollection('notifications');
        global.MONGO_COLLECTION_NOTIFICATIONS = await global.MONGO_DB.collection('notifications');

        let subscriptionsCollection = await global.MONGO_DB.collection('subscriptions');
        if(!subscriptionsCollection) await global.MONGO_DB.createCollection('subscriptions');
        global.MONGO_COLLECTION_SUBSCRIPTIONS = await global.MONGO_DB.collection('subscriptions');

        // Sending data to each connected SSE client
        console.error(`SERVER | SSE: start polling data to client...`);
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

    // 1hr lifetime
    if(Date.now() - spotifyTokenLifetime > 3500000) {
        request.post(global.authOptions, function(error, response, body) {
            spotifyTokenLifetime = Date.now();
            global.LOG.info('SERVER | Get [spotify] token');
            global.SPOTIFY_TOKEN = body.access_token;
            next();
        });
    } else {
        global.LOG.info('SERVER | Get cached [spotify] token: ' + ((Date.now() - spotifyTokenLifetime) / 1000 / 60 / 24).toFixed(3) + ' hr');
        next();
    }
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broken!');
});


app.get('/send', async (req, res)=> {

    const message = {
        notification: {
            title: 'TEST release!',
            body: 'TEST'
        },
        topic: 'test' // 'allDevices'
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    // admin.messaging().send(message)
    //     .then((response) => {
    //         // Response is a message ID string.
    //         console.log('Successfully sent message:', response);
    //         // res.send('Hello World!');
    //     })
    //     .catch((error) => {
    //         console.log('Error sending message:', error);
    //     });

    const message2 = {
        notification: {
            title: 'New release!',
            body: '${newRelease.artist} - ${newRelease.name}'
        },
        topic: 'JKooKnosrveuLhmbnpdDVAUk6Cp1' // 'allDevices'
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    // admin.messaging().send(message2)
    //     .then((response) => {
    //         // Response is a message ID string.
    //         console.log('Successfully sent message2:', response);
    //         res.send('sended');
    //         // res.send('Hello World!');
    //     })
    //     .catch((error) => {
    //         console.log('Error sending message2:', error);
    //         res.send("Not Hello World!");
    //     });
} );


//app.get('/stream', global.SSE.init)
app.get('/spotify/token', (req, res)=> res.send({ token: global.SPOTIFY_TOKEN }));
app.get('/releases/:days', releasesDaysRoute);
app.get('/releases/:artist/:days', releasesArtistDaysRoute);
app.get('/releases/:artist/:days/:uid', releasesArtistDaysRoute);

app.get('/concerts/:artist', findConcerts);

app.get('/fcm/subscribe/:token/:topic', FCMSubscribe)
app.get('/fcm/unsubscribe/:token/:topic', FCMUnsubscribe)

app.get('/find/:group/:album', findGroupAlbumRoute);

app.get('/mongo/get/:collection', mongoGetCollection);
app.get('/mongo/get/:collection/:uid', mongoGetCollection);
app.post('/mongo/save/:collection', mongoSaveCollection);
app.post('/mongo/delete/:collection/:_id', mongoDeleteCollection);
app.get('/mongo/remove/:collection', mongoRemoveCollection);

// // Sokker
// app.get('/sokker/player/:pid', sokkerPlayer);
// app.get('/sokker/team/:teamID', sokkerTeam);

// study-ua
//app.get('/study-ua/users-docs', usersDocsList);


app.listen(process.env.PORT || 3000, function() {
    global.LOG.info(`SERVER app listening on port ${process.env.PORT || 3000}!`);
});
