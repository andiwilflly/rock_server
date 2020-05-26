const yandexParser = require('../../@parsers/yandex.parser');
const googleParser = require('../../@parsers/google.parser');
const appleParser = require('../../@parsers/apple.parser');
const youTubeParser = require('../../@parsers/youtube.parser');
const soundCloudParser = require('../../@parsers/soundcloud.parser');
const lastFmParser = require('../../@parsers/last.fm.parser');
const spotifyParser = require('../../@parsers/spotify.pareser');


// When build error
// heroku restart
// heroku builds:cancel


module.exports = async function (req, res, BROWSER) {

    const resources = req.query.q ? req.query.q.toLowerCase().split(',') : [];
    const group = req.params.group.toLowerCase();
    const album = req.params.album.toLowerCase();

    console.log(resources);

    Promise.all([
        !resources.length || resources.includes('spotify') ? spotifyParser(group, album) : null,
        !resources.length || resources.includes('lastfm') ? lastFmParser(group, req.params.album) : null,
        !resources.length || resources.includes('yandex') ? yandexParser(BROWSER, group, album) : null,
        !resources.length || resources.includes('google') ? googleParser(BROWSER, group, album) : null,
        !resources.length || resources.includes('apple') ? appleParser(BROWSER, group, album) : null,
        !resources.length || resources.includes('soundcloud') ? soundCloudParser(BROWSER, group, album) : null,
        !resources.length || resources.includes('youtube') ? youTubeParser(BROWSER, group, album, req.params.group) : null,
    ]).then((results)=> {
        res.send(results.filter(Boolean).reduce((res, resource)=> {
            res[resource.source] = resource;
            return res;
        }, {}));
    });
}