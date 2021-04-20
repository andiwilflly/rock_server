let request = require('request');
request = request.defaults({ jar: true });
// Utils
const parsePlayer = require('./utils/parsePlayer.util');
const logIn = require('./utils/logIn.util');


module.exports = async function (req, res) {

    logIn((error, response, body)=> {
        request(`http://sokker.org/player/PID/${req.params.pid}`, (error, response, body)=> {
            res.send(JSON.stringify(parsePlayer({ body, pid: req.params.pid })));
        });
    });
};