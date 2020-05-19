const fs = require('fs');
const express = require('express');
const newReleases = require('./newReleases/newReleases');
// Stdout and file logger
const path = './server/project.log'
try {
    fs.unlinkSync(path);
} catch(err) {
    console.error(err);
}
global.LOG = require('simple-node-logger').createSimpleLogger('./server/project.log');
// Parts
require('./server/cron');
require('./server/parts/initializeFirebase');
// Routes
const findGroupAlbumRoute = require('./server/routes/find[group][album].get.route');

const app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/newReleases/:days', function (req, res) {
    newReleases(res);
});

app.get('/newReleases/:artist/:days', function (req, res) {
    // newReleases(res);
});


// https://www.spotify.com/
// https://www.deezer.com/
app.get('/find/:group/:album', findGroupAlbumRoute);

app.listen(process.env.PORT || 3000, function() {
    global.LOG.info('Example app listening on port 3000!');
});
