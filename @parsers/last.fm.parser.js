// const Fuse = require('fuse.js');

const LASTFM_API_KEY = '8ecb1efa682d2b9fb834f9e757e4fc0b';

async function fetchFromApi(group, album) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(group)}&album=${encodeURIComponent(album)}&api_key=${LASTFM_API_KEY}&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        return { source: 'lastfm', error: `Last.fm API: ${data.message}` };
    }

    const images = data.album.image || [];
    const image = ([...images].reverse().find(img => img['#text'])?.['#text'] || null)?.replace(/\/\d+x\d+\//, '/800x800/');

    return { source: 'lastfm', link: data.album.url, ...(image && { image }) };
}


async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(50000);
        await page.goto(`https://www.last.fm/music/${`${group.replace(/ /g, '+')}/${album.replace(/ /g, '+')}`}`, {
            waitUntil: 'networkidle0'
        });
        console.log(`✨ LAST.FM PARSER | page loaded...`, `https://www.last.fm/music/${`${group.replace(/ /g, '+')}/${album.replace(/ /g, '+')}`}`);
        await new Promise(r => setTimeout(r, 1000));

        let headerText = await page.evaluate(() => {
            const el = document.querySelector('.header-new-title');
            return el ? el.innerText : null;
        });

        if (!headerText) {
            await page.close();
            return { source: 'lastfm', error: `Page structure not found or blocked: ${group} - ${album}` };
        }

        const isFound = headerText.toLowerCase().includes(album);

        if (!isFound) {
            await page.close();
            return {
                source: 'lastfm',
                error: `No such album in last fm: ${group} - ${album}`
            }
        }

        await page.close();
        return {
            source: 'lastfm',
            link: `https://www.last.fm/music/${group.replace(/ /g, '+')}/${album.replace(/ /g, '+')}`
        };
    }
    catch(e) {
            return {source: 'lastfm', error: e.toString()};
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album) {
    console.log('✨ LAST.FM PARSER:START...');
    const response = await fetchFromApi(group, album);
    console.log('✨ LAST.FM PARSER:END');
    return response;
}

module.exports = start;


// const options = {
//     includeScore: true,
//     shouldSort: true,
//     threshold: 0.4,
//     keys: ["artist"]
// };
//
// async function start(artistName, albumName) {
//     console.log('✨ LAST.FM PARSER:START...');
//
//     // Cache
//     if(parserStore.get(`lastfm.${artistName}.${albumName}`)) console.log('🆘 LAST.FM PARSER: RETURN CACHE...');
//     if(parserStore.get(`lastfm.${artistName}.${albumName}`)) return parserStore.get(`lastfm.${artistName}.${albumName}`);
//
//
//     let albums = await fetch(`http://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(albumName)}&api_key=${'8ecb1efa682d2b9fb834f9e757e4fc0b'}&format=json`);
//     albums = await albums.json();
//
//     const fuse = new Fuse(albums.results.albummatches.album, options);
//
//     let matchedAlbum = fuse.search(artistName)[0];
//
//     if(!matchedAlbum) return {
//         error: `Error ${artistName} - ${albumName} (not found)`,
//         source: 'lastfm'
//     }
//
//     matchedAlbum = matchedAlbum.item;
//
//     console.log('✨ LAST.FM PARSER:END');
//     return {
//         link: matchedAlbum.url,
//         image: matchedAlbum.image[matchedAlbum.image.length-1]['#text'],
//         source: 'lastfm'
//     };
// }
//
// module.exports = start;
