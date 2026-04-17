const cron = require('node-cron');
const admin = require("firebase-admin");
const firebase = require('firebase');
// Routes
const releasesDaysRoute = require('../server/routes/releases[days].get.route');
// Parts
const newReleasesCreateNotifications = require('./parts/newReleasesCreateNotifications');


cron.schedule('0 */12 * * *', async () => {
    global.LOG.info(`CRON | [releases] task run at: [${new Date().toLocaleString()}]`);

    const response = await fetch(global.authOptions.url, {
        method: 'POST',
        headers: global.authOptions.headers,
        body: new URLSearchParams(global.authOptions.form)
    });
    const body = await response.json();
    global.LOG.info('SERVER | Get [spotify] token');
    global.SPOTIFY_TOKEN = body.access_token;

    releasesDaysRoute({ params: { days: 5 }}, { send: (NEW_RELEASES)=> {
        global.LOG.info('CRON | [releases] task executed, NEW_RELEASES: ', Object.keys(NEW_RELEASES));

        newReleasesCreateNotifications(NEW_RELEASES);
    }});
});

global.LOG.info('CRON | initialized...');
