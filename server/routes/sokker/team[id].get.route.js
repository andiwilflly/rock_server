const { JSDOM } = require("jsdom");
const parsePlayer = require('./utils/parsePlayer.util');
const logIn = require('./utils/logIn.util');


module.exports = async function (req, res) {
    const cookies = await logIn();
    const response = await fetch(`http://sokker.org/players/teamID/${req.params.teamID}`, {
        headers: { Cookie: cookies }
    });
    const body = await response.text();
    const dom = new JSDOM(body);
    const document = dom.window.document;

    res.send(JSON.stringify([
        [...document.querySelectorAll('.panel-body .well')].map($player => parsePlayer({
            body: $player.innerHTML,
            teamID: req.params.teamID
        }))
    ]));
};
