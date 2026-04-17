const parsePlayer = require('./utils/parsePlayer.util');
const logIn = require('./utils/logIn.util');


module.exports = async function (req, res) {
    const cookies = await logIn();
    const response = await fetch(`http://sokker.org/player/PID/${req.params.pid}`, {
        headers: { Cookie: cookies }
    });
    const body = await response.text();
    res.send(JSON.stringify(parsePlayer({ body, pid: req.params.pid })));
};
