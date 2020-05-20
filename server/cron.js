const cron = require('node-cron');
const admin = require("firebase-admin");
const request = require('request');
const firebase = require('firebase');
// Routes
const releasesDaysRoute = require('../server/routes/releases[:days].get.route');
// Parts
const newReleasesCreateNotifications = require('./parts/newReleasesCreateNotifications');


cron.schedule('0 */12 * * *', () => {
    global.LOG.info(`CRON | [releases] task run at: [${new Date().toLocaleString()}]`);

    request.post(global.authOptions, function(error, response, body) {
        global.LOG.info('SERVER | Get [spotify] token');
        global.SPOTIFY_TOKEN = body.access_token;

        releasesDaysRoute({ params: { days: 5 }}, { send: (NEW_RELEASES)=> {
            global.LOG.info('CRON | [releases] task executed, NEW_RELEASES: ', Object.keys(NEW_RELEASES));

            newReleasesCreateNotifications(NEW_RELEASES);
        }});
    });
});

global.LOG.info('CRON | initialized...');
