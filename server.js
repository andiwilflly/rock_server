const fs = require('fs');
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


app.get('/',(req, res)=> res.send('Hello World!') );
app.get('/token', (req, res)=> res.send({ token: global.SPOTIFY_TOKEN }));
app.get('/releases/:days', releasesDaysRoute);
app.get('/releases/:artist/:days', releasesArtistDaysRoute);


// https://www.spotify.com/
// https://www.deezer.com/
app.get('/find/:group/:album', findGroupAlbumRoute);

app.listen(process.env.PORT || 3000, function() {
    global.LOG.info(`SERVER app listening on port ${process.env.PORT || 3000}!`);
});
