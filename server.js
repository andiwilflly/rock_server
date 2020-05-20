const fs = require('fs');
const admin = require("firebase-admin");
const request = require('request');
const express = require('express');
// Logger
try {  fs.unlinkSync('./server/project.log'); } catch(err) { console.error(err); }
global.LOG = require('simple-node-logger').createSimpleLogger('./server/project.log');
// Parts
require('./server/cron');
require('./server/parts/initializeFirebase');
// Utils
require('./server/utils/extendJs.utils');
// Routes
const releasesDaysRoute = require('./server/routes/releases[:days].get.route');
const releasesArtistDaysRoute = require('./server/routes/releases[:artist][:days].get.route');
const findGroupAlbumRoute = require('./server/routes/find[:group][:album].get.route');


global.BASE_URL = 'https://newrockbot.herokuapp.com';
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

const app = express();

app.use(function (req, res, next) {
    request.post(global.authOptions, function(error, response, body) {
        global.LOG.info('SERVER | Get [spotify] token');
        global.SPOTIFY_TOKEN = body.access_token;
        next();
    });
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broken!');
});


app.get('/',(req, res)=> {

    const message = {
        notification: {
            title: 'New release!',
            body: '${newRelease.artist} - ${newRelease.name}'
        },
        topic: 'allDevices'
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            res.send('Hello World!');
        })
        .catch((error) => {
            console.log('Error sending message:', error);
            res.send('Not Hello World!');
        });
} );
app.get('/token', (req, res)=> res.send({ token: global.SPOTIFY_TOKEN }));
app.get('/releases/:days', releasesDaysRoute);
app.get('/releases/:artist/:days', releasesArtistDaysRoute);
app.get('/releases/:artist/:days/:uid', releasesArtistDaysRoute);


// https://www.spotify.com/
// https://www.deezer.com/
app.get('/find/:group/:album', findGroupAlbumRoute);

app.listen(process.env.PORT || 3000, function() {
    global.LOG.info(`SERVER app listening on port ${process.env.PORT || 3000}!`);
});
