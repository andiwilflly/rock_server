const parserStore = require('data-store')({ path: process.cwd() + '/DB/parserStore.json' });


// const searchAlbum = require('../server/parts/youtube/searchAlbum.youtube.api');
//
//
// // https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
// async function start(artistName, albumName) {
//     console.log('✨ YOUTOBE PARSER:START...');
//
//     const matchedAlbum = await searchAlbum(artistName, albumName).catch(e => console.log(e));
//
//     if(!matchedAlbum) return {
//         error: `Album [${artistName} - ${albumName}] not found`,
//         source: 'youtube'
//     }
//
//     console.log('✨ YOUTOBE PARSER:END');
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

        await page.goto(`https://music.youtube.com/search?q=${encodeURIComponent(group)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        console.log(`✨ YOUTOBE PARSER | page loaded...`);

        const artistPageLink = await page.evaluate((_originalGroupName)=> {
            const $artistPageLink = [...document.querySelectorAll('h2.title')]
                .find($title =>
                    $title.innerText.includes('Виконавці') ||
                    $title.innerText.includes('Artists') ||
                    $title.innerText.includes('Найпопулярніші') ||
                    $title.innerText.includes('Top result'))
                .parentElement.querySelector('a');

            return $artistPageLink ? $artistPageLink.getAttribute('href') : null;
        }, originalGroupName);
        if(!artistPageLink) await page.close();
        if(!artistPageLink) return { source: 'youtube', error: `Can't find artistPageLink` };


        // Artist page
        await page.goto(`https://music.youtube.com/${artistPageLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);

        console.log(`✨ YOUTOBE PARSER | artist page loaded...`, `https://music.youtube.com/${artistPageLink}`);


        const albumPageLink = await page.evaluate((_album)=> {
            let $albumPageLink = null;

            $albumPageLink = [...[...document.querySelectorAll('#contents h2')]
                .find($title => $title.innerText.includes('Альбоми')  || $title.innerText.includes('Albums'))
                .parentElement.parentElement
                .querySelectorAll('.carousel ytmusic-two-row-item-renderer')]
                .find($item => $item.querySelector('.title').innerText.toLowerCase().includes(_album));

            $albumPageLink = $albumPageLink || [...[...document.querySelectorAll('#contents h2')]
                .find($title => $title.innerText.includes('Сингли') || $title.innerText.includes('Singles'))
                .parentElement.parentElement
                .querySelectorAll('.carousel ytmusic-two-row-item-renderer')]
                .find($item => $item.querySelector('.title').innerText.toLowerCase().includes(_album));

            return $albumPageLink ? $albumPageLink.querySelector('a').getAttribute('href') : null;
        }, album);

        if(!albumPageLink) await page.close();
        if(!albumPageLink) return { source: 'youtube', error: `Can't find albumPageLink` };

        console.log(`✨ YOUTOBE PARSER | albums page link received... ${albumPageLink}`);

        await page.close();
        return {
            source: 'youtube',
            link: `https://music.youtube.com/${albumPageLink}`
        };
    } catch(e) {
        return { source: 'youtube', error: e.toString() };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album, originalGroupName) {
    console.log('✨ YOUTOBE PARSER:START...');

    // Cache
    if(parserStore.get(`youtube.${group}.${album}`)) console.log('🆘 YOUTOBE PARSER: RETURN CACHE...');
    if(parserStore.get(`youtube.${group}.${album}`)) return parserStore.get(`youtube.${group}.${album}`);

    const response = await parsePage(browser, group, album, originalGroupName);

    console.log('✨ YOUTOBE PARSER:END', response);
    return response;
}

module.exports = start;