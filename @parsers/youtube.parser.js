const searchAlbum = require('../server/parts/youtube/searchAlbum.youtube.api');


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(artistName, albumName) {
    console.log('✨ YOUTOBE PARSER:START...');

    const matchedAlbum = await searchAlbum(artistName, albumName);

    if(!matchedAlbum) return {
        error: `Album [${artistName} - ${albumName}] not found`,
        source: 'youtube'
    }

    console.log('✨ YOUTOBE PARSER:END');
    return {
        source: 'youtube',
        ...matchedAlbum
    };
}

module.exports = start;