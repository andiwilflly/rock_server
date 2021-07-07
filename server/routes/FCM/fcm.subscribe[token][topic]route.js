const admin = require("firebase-admin");


module.exports = function(req, res) {
    // admin.messaging().subscribeToTopic([req.params.token], req.params.topic)
    //     .then(function(response) {
    //         //global.SSE.send(['Successfully subscribed to topic' + req.params.topic]);
    //         res.send(JSON.stringify({
    //             msg: `Subscribed to topic: ${req.params.topic}`,
    //             success: true
    //         }));
    //     })
    //     .catch(function(error) {
    //         //global.SSE.send(['Error subscribing from topic' + req.params.topic]);
    //         res.send(JSON.stringify({
    //             msg: error,
    //             error: true
    //         }));
    //     });
}
