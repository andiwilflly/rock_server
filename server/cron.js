const cron = require('node-cron');
const admin = require("firebase-admin");
const request = require('request');
const firebase = require('firebase');
// Routes
const releasesDaysRoute = require('../server/routes/releases[:days].get.route');


cron.schedule('0 */12 * * *', () => {
    global.LOG.info(`CRON | [releases] task run at: [${new Date().toLocaleString()}]`);
    console.log('running a task every 5 minutes');

    request.post(global.authOptions, function(error, response, body) {
        global.LOG.info('SERVER | Get [spotify] token');
        global.SPOTIFY_TOKEN = body.access_token;

        releasesDaysRoute({ params: { days: 5 }}, { send: (NEW_RELEASES)=> {
            global.LOG.info('CRON | [releases] task executed, NEW_RELEASES: ', Object.keys(NEW_RELEASES));

            const DB = firebase.firestore();
            for(const newRelease of Object.values(NEW_RELEASES)) {
                DB.collection('notifications')
                    .doc(newRelease.name)
                    .set(newRelease)
                    .then(function() {
                        console.log("Document successfully written!");

                        const message = {
                            notification: {
                                title: 'New release!',
                                body: `${newRelease.artist} - ${newRelease.name}`
                            },
                            topic: 'allDevices'
                        };

                        // Send a message to the device corresponding to the provided
                        // registration token.
                        admin.messaging().send(message)
                            .then((response) => {
                                // Response is a message ID string.
                                console.log('Successfully sent message:', response);
                            })
                            .catch((error) => {
                                console.log('Error sending message:', error);
                            });
                    })
                    .catch(function(error) {
                        console.error("Error writing document: ", error);
                    });
            }
        }});
    });
});

global.LOG.info('CRON | initialized...');
