

// const searchAlbum = require('../server/parts/youtube/searchAlbum.youtube.api');
//
//
// // https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
// async function start(artistName, albumName) {
//     console.log('✨ YOUTUBE PARSER:START...');
//
//     const matchedAlbum = await searchAlbum(artistName, albumName).catch(e => console.log(e));
//
//     if(!matchedAlbum) return {
//         error: `Album [${artistName} - ${albumName}] not found`,
//         source: 'youtube'
//     }
//
//     console.log('✨ YOUTUBE PARSER:END');
//     return {
//         source: 'youtube',
//         ...matchedAlbum
//     };
// }
//
// module.exports = start;

async function parsePage(browser, group, album, originalGroupName) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://music.youtube.com/search?q=${encodeURIComponent(group)} - ${encodeURIComponent(album)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        console.log(`✨ YOUTUBE PARSER | page loaded...`, `https://music.youtube.com/search?q=${encodeURIComponent(group)}`);

        const artistPageLink = await page.evaluate((_album)=> {
            const $artistPageLink = [...document.querySelectorAll('.yt-simple-endpoint.style-scope.ytmusic-responsive-list-item-renderer')]
                .find($link => $link.getAttribute('aria-label').toLowerCase().includes(_album));

            return $artistPageLink ? $artistPageLink.getAttribute('href') : null;
        }, album);
        if(!artistPageLink) await page.close();
        if(!artistPageLink) return { source: 'youtube', error: `Can't find ${group} - ${album} (https://music.youtube.com/search?q=${encodeURIComponent(group)} - ${encodeURIComponent(album)})` };

        return {
            source: 'youtube',
            link: `https://music.youtube.com/${artistPageLink}`
        };
    } catch(e) {
        return { source: 'youtube', error: e.toString() };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album, originalGroupName) {
    console.log('✨ YOUTUBE PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `youtube | ${group} | ${album}` });
    if(prevResult) console.log('🌼 MONGO DB | YOUTUBE PARSER: return prev result...');
    if(prevResult) return prevResult;

    const response = await parsePage(browser, group, album, originalGroupName);

    console.log('✨ YOUTUBE PARSER:END', response);
    return response;
}

module.exports = start;