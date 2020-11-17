

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

async function findInSongs(page, group, album) {

    const isFound = await page.evaluate((_group, _album)=> {
        const $item = [...document.querySelectorAll('div.ytmusic-play-button-renderer')].map($el => {
            return $el.closest('.ytmusic-shelf-renderer')
        }).find($el => {
            const title = $el.querySelector('.title').innerText.toLowerCase();
            return title.includes(_group) && title.includes(_album);
        });
        if(!$item) return null;

        $item.querySelector('div.ytmusic-play-button-renderer').click();
        return true;
    }, group, album);

    if(!isFound) return null;
    await page.waitFor(2500);
    return page.url();
}


async function parsePage(browser, group, album, originalGroupName, originalAlbumName) {
    try {
        const page = await browser.newPage();

        const q = `${encodeURIComponent(group.split(' ').join('+'))}+-+${encodeURIComponent(album.split(' ').join('+'))}`;

        await page.goto(`https://music.youtube.com/search?q=${q}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        console.log(`✨ YOUTUBE PARSER | page loaded...`, `https://music.youtube.com/search?q=${q}`);

        await page.waitFor(1000);

        let artistPageLink = await page.evaluate((_album)=> {
            const $link = [
                ...document.querySelectorAll('.yt-simple-endpoint.yt-formatted-string'),
                ...document.querySelectorAll('.yt-simple-endpoint.style-scope.ytmusic-responsive-list-item-renderer')
            ]
                .find($el =>
                    $el.innerText.toLowerCase() === _album ||
                    $el.getAttribute('aria-label') && $el.getAttribute('aria-label').toLowerCase() === _album);
            if(!$link) return null;
            return $link.getAttribute('href');
        }, album);

        console.log(artistPageLink, 1);

        if(!artistPageLink) artistPageLink = await page.evaluate((_album)=> {
            const $artistPageLink = [...document.querySelectorAll('.yt-simple-endpoint.style-scope.ytmusic-responsive-list-item-renderer')]
                .find($link => $link.getAttribute('aria-label').toLowerCase().includes(_album));

            return $artistPageLink ? $artistPageLink.getAttribute('href') : null;
        }, album);

        console.log(artistPageLink, 2);

        if(!artistPageLink) artistPageLink = await findInSongs(page, group, album);


        console.log(artistPageLink, 4);

        if(!artistPageLink) return { source: 'youtube', error: `Can't find (https://music.youtube.com/search?q=${q})` };

        await page.close();
        return {
            source: 'youtube',
            link: artistPageLink.includes('https') ? artistPageLink : `https://music.youtube.com/${artistPageLink}`
        };
    } catch(e) {
        return { source: 'youtube', error: e.toString() };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album, originalGroupName, originalAlbumName) {
    console.log('✨ YOUTUBE PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `youtube | ${group} | ${album}` });
    if(prevResult) console.log('🌼 MONGO DB | YOUTUBE PARSER: return prev result...');
    if(prevResult) return prevResult;

    const response = await parsePage(browser, group, album, originalGroupName, originalAlbumName);

    console.log('✨ YOUTUBE PARSER:END', response);
    return response;
}

module.exports = start;