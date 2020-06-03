const setupPage = require('../server/utils/setupPage.utils');


async function parsePage(browser, group, album) {
    try {
        const page = await setupPage(browser);

        await page.goto(`https://music.yandex.ua/search?text=${group}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);

        console.log(`✨ YANDEX PARSER | search groups page loaded...`);

        const artistLink = await page.evaluate((_group)=> {
            const $artistLink = [ ...document.querySelectorAll('.serp-snippet__artists > .artist .artist__name a') ]
                .find($artist => $artist.innerText.toLowerCase().includes(_group));

            return $artistLink ? $artistLink.getAttribute('href') : null;
        }, group);

        if(!artistLink) await page.close();
        if(!artistLink) return { source: 'yandex', error: `No such group: ${group}` };

        console.log(`✨ YANDEX PARSER | find artistLink: https://music.yandex.ua${artistLink}...`);

        await page.goto(`https://music.yandex.ua${artistLink}/albums`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);


        const albumLink = await page.evaluate((_album)=> {
            const $album = [...document.querySelector('.page-artist__albums').querySelectorAll('.album')]
                .find($artist => $artist.querySelector('.album__title.typo-main').innerText.toLowerCase().includes(_album));

            return $album ? $album.querySelector('a').getAttribute('href') : null;
        }, album)

        if(!albumLink) await page.close();
        if(!albumLink) return { source: 'yandex', error: `No such album: ${album}` };

        console.log('✨ YANDEX ENTER page', `https://music.yandex.ua${albumLink}`);


        // Album page
        await page.goto(`https://music.yandex.ua${albumLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        await page.$eval('.entity-cover__image', ($el)=> $el.click());

        const albumImg = await page.evaluate(()=> document.querySelector('.cover-popup__item.cover-popup__cover').getAttribute('src'));

        await page.close();
        return {
            source: 'yandex',
            link: `https://music.yandex.ua${albumLink}`,
            image: albumImg.replace('//', 'https://')
        };

    } catch(e) {
        return { source: 'yandex', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ YANDEX PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `yandex.${group}.${album}` });
    if(prevResult) console.log('🌼 MONGO DB | YANDEX PARSER: return prev result...');
    if(prevResult) return prevResult;


    const response = await parsePage(browser, group, album);

    console.log('✨ YANDEX PARSER:END', response);
    return response;
}

module.exports = start;

// const YandexMusicApi = require('yandex-music-api');
// const api = new YandexMusicApi();
//
//
// async function start(artistName, albumName) {
//     console.log('✨ YANDEX PARSER:START...');
//
//
//
// // https://oauth.yandex.ru/authorize?response_type=token&client_id=04f5b37eee964a60840928cecabd5b23
// // AgAAAABBggGPAAZgLXhpsUqnoEd6mLao3OyMEJE&token_type=bearer&expires_in=31536000
//
//
//
//     await api.init({username: 'andiwillfly@gmail.com', password: 'ward121314'})
//         .then(function(token) {
//             console.log('uid: ' + token.uid);
//             console.log('token: ' + token.access_token);
//             console.log('expires in: ' + new Date(new Date().getTime() + token.expires_in * 1000));
//         })
//         .catch(e => console.log(42, e));
//
//     let matchedAlbum = await api.search(`${encodeURIComponent(artistName)} - ${encodeURIComponent(albumName)}`).catch(e => console.log(44, e));
//
//     if(!matchedAlbum) return {
//         error: `Album [${artistName} - ${albumName}] not found`,
//         source: 'yandex'
//     }
//
//     matchedAlbum = matchedAlbum.best;
//
//     if(!matchedAlbum) return {
//         error: `Album [${artistName} - ${albumName}] not match result`,
//         source: 'yandex'
//     }
//
//     console.log('✨ YANDEX PARSER:END', `${artistName} - ${albumName}`);
//     return {
//         source: 'yandex',
//         type: matchedAlbum.type,
//         version: matchedAlbum.result.version,
//         albumName: matchedAlbum.result.title,
//         artistName: matchedAlbum.result.artists[0].name,
//         link: `https://music.yandex.ua/album/${matchedAlbum.result.id}`,
//         trackCount: matchedAlbum.result.trackCount,
//         genre: matchedAlbum.result.genre,
//         image: `https://${matchedAlbum.result.coverUri.replace('%%', 'm1000x1000')}`
//     };
// }
//
// module.exports = start;
