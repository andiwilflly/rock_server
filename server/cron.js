const cron = require('node-cron');
const request = require('request');
// Routes
const releasesDaysRoute = require('../server/routes/releases[:days].get.route');


cron.schedule('*/1 * * * *', () => {
    global.LOG.info(`CRON | [releases] task run at: [${new Date().toLocaleString()}]`);
    console.log('running a task every 5 minutes');

    request.post(global.authOptions, function(error, response, body) {
        global.LOG.info('SERVER | Get [spotify] token');
        global.SPOTIFY_TOKEN = body.access_token;

        releasesDaysRoute({ params: { days: 1 }}, { send: (NEW_RELEASES)=> {
             console.log('CRON | [releases] task executed, NEW_RELEASES: ', Object.keys(NEW_RELEASES));
        }});
    });
});

global.LOG.info('CRON | initialized...');
