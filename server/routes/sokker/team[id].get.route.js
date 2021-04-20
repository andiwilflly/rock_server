const jsdom = require("jsdom");
let request = require('request');
request = request.defaults({ jar: true });
// Utils
const parsePlayer = require('./utils/parsePlayer.util');
const logIn = require('./utils/logIn.util');


const { JSDOM } = jsdom;

module.exports = async function (req, res) {

    logIn((error, response, body)=> {
        request(`http://sokker.org/players/teamID/${req.params.teamID}`, (error, response, body)=> {
            const dom = new JSDOM(body);
            const document = dom.window.document;

            res.send(JSON.stringify([
                [...document.querySelectorAll('.panel-body .well')].map($player => parsePlayer({
                    body: $player.innerHTML,
                    teamID: req.params.teamID
                }))
            ]))
        });
    });
};