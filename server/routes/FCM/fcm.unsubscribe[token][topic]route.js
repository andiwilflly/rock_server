const admin = require("firebase-admin");


module.exports = function(req, res) {
    // admin.messaging().unsubscribeFromTopic([req.params.token], req.params.topic)
    //     .then(function(response) {
    //         //global.SSE.send(['Successfully unsubscribed to topic' + req.params.topic]);
    //         res.send(JSON.stringify({
    //             msg: `Unsubscribed to topic: ${req.params.topic}`,
    //             success: true
    //         }));
    //     })
    //     .catch(function(error) {
    //         //global.SSE.send(['Error unsubscribing to topic' + req.params.topic]);
    //         res.send(JSON.stringify({
    //             msg: error,
    //             error: true
    //         }));
    //     });
}
