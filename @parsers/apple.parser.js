const translit = require("../server/utils/translit");


async function fetchFromApi(group, album) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(`${group} ${album}`)}&media=music&entity=album&limit=10`;
    const response = await fetch(url);
    const data = await response.json();

    const items = data.results || [];
    const groupLower = group.toLowerCase();
    const albumLower = album.toLowerCase();

    const match =
        items.find(item =>
            item.collectionName?.toLowerCase() === albumLower &&
            item.artistName?.toLowerCase() === groupLower
        ) ||
        items.find(item =>
            item.collectionName?.toLowerCase().includes(albumLower) &&
            item.artistName?.toLowerCase() === groupLower
        );

    if (match) {
        const image = match.artworkUrl100?.replace('100x100bb', '800x800bb') || null;
        const link = match.collectionViewUrl?.replace(/\?.*$/, '') || null;
        return {
            source: 'apple',
            link,
            ...(image && { image }),
        };
    }

    const songResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(`${group} ${album}`)}&media=music&entity=song&limit=10`);
    const songData = await songResponse.json();
    const songs = songData.results || [];

    const songMatch =
        songs.find(item =>
            item.trackName?.toLowerCase() === albumLower &&
            item.artistName?.toLowerCase() === groupLower
        ) ||
        songs.find(item =>
            item.trackName?.toLowerCase().includes(albumLower) &&
            item.artistName?.toLowerCase() === groupLower
        );

    if (!songMatch) {
        return { source: 'apple', error: `Not found via API: ${group} - ${album}` };
    }

    const image = songMatch.artworkUrl100?.replace('100x100bb', '800x800bb') || null;
    const link = songMatch.trackViewUrl?.replace(/[?&]uo=\d+/g, '').replace(/[?&]$/, '') || null;

    return {
        source: 'apple',
        link,
        ...(image && { image }),
    };
}


async function waitForPage(page, iteration) {
    if(iteration > 5) return;
    console.log('APPLE PARSER | waiting page... ', iteration, page.url());
    await new Promise(r => setTimeout(r, 1500));
    return page.url().includes('search?') ? await waitForPage(page, iteration+1) : page.url();
}


async function parsePage(browser, group, album) {
    const page = await browser.newPage();
    try {
        page.setDefaultNavigationTimeout(50000);

        await page.goto(`https://music.apple.com/us/search?term=${encodeURIComponent(`${group.replace(/'/g, '')} - ${album.replace(/'/g, '')}`)}`, {
            waitUntil: 'networkidle0'
        });
        await new Promise(r => setTimeout(r, 1000));
        console.log(`✨ APPLE PARSER | page loaded...`, `https://music.apple.com/us/search?term=${encodeURIComponent(`${group.replace(/'/g, '')} - ${album.replace(/'/g, '')}`)}`);

        const trGroup = translit(group);
        const isFound = await page.evaluate((_group, _album, _trGroup)=> {
            const $albumEl = [...document.querySelectorAll('.shelf-grid__list .shelf-grid__list-item .product-lockup')]
                .find($el =>
                    $el.innerText.toLowerCase().startsWith(_album) && !$el.className.includes('artist') && ($el.innerText.toLowerCase().includes(_group) || $el.innerText.toLowerCase().includes(_trGroup))
                );
            let isFound = !!$albumEl;
            if($albumEl) $albumEl.click();
            if (isFound) {
                return isFound;
            }
            const $songEl = [...document.querySelectorAll('.shelf-grid__list .shelf-grid__list-item .track-lockup')]
                .find($el =>
                    $el.innerText.toLowerCase().startsWith(_album) && !$el.className.includes('artist') && ($el.innerText.toLowerCase().includes(_group) || $el.innerText.toLowerCase().includes(_trGroup))
                );
            isFound = !!$songEl;
            if($songEl) $songEl.click();
            return isFound;
        }, group, album, trGroup);

        await waitForPage(page, 1);

        if(!isFound) return {
            source: 'apple',
            error: `Not found https://music.apple.com/us/search?term=${encodeURIComponent(`${group.replace(/'/g, '')} - ${album.replace(/'/g, '')}`)}`
        }

        /*const isFoundArtist = await page.evaluate((_group, _trGroup)=> {
            const $artistEl = document.querySelector('div.product-creator.typography-large-title').innerText.toLowerCase().trim();
            return ($artistEl.startsWith(_group) || $artistEl.startsWith(_trGroup));
        }, group, trGroup);

        if(!isFoundArtist) return {
            source: 'apple',
            error: `Not found Artist: ${group}, BUT Album: ${album} is found`
        }*/

        return {
            source: 'apple',
            link: `${page.url()}`.replace('beta.', '')
        };

    } catch(e) {
        return { source: 'apple', error: e.toString() };
    } finally {
        await page.close().catch(() => {});
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album) {
    console.log('✨ APPLE PARSER:START...');
    const response = await fetchFromApi(group, album);
    console.log('✨ APPLE PARSER:END', response);
    return response;
}

module.exports = start;
