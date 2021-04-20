

async function findAlbum(page, group, album) {
    return await page.evaluate((_group, _album)=> {
        const $albumTitle = [...document.querySelectorAll('.heading-2.search-title')].find($title =>  $title.innerText.includes('Albums'));
        if(!$albumTitle) return null;

        const $albums = [...$albumTitle.parentElement.querySelectorAll('.thumbnail-col')];
        if(!$albums.length) return null;

        return $albums.find($album => {
            const albumName = $album.querySelector('.heading-4').innerText.toLowerCase();
            const groupName = $album.querySelector('.heading-4-sub a').innerText.toLowerCase();

            if(!albumName.includes(_album)) return null;
            if(!groupName.includes(_group)) return null;

            return true;
        }).querySelector('.heading-4 a').getAttribute('href');
    }, group, album);
}


async function findTrack(page, group, album) {
    return await page.evaluate((_group, _album)=> {
        const $rows = [...document.querySelectorAll('.datagrid-row')];

        const rows = $rows.map($row => {
            const $cells = [...$row.querySelectorAll('.datagrid-label.datagrid-label-main')];
            const $trackCell = $cells.find($cell => $cell.innerText.toLowerCase().includes(_album.toLowerCase()))
            if(!$trackCell) return null;

            return $trackCell.getAttribute('href');
        }).filter(Boolean);

        if(!rows.length) return null;

        return rows[0];

    }, group, album);
}


async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://www.deezer.com/search/${group} - ${album}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ DEZZER PARSER | page loaded...`);

        try { await page.click('.cookie-btn'); } catch {}

        const albumLink = await findAlbum(page, group, album);

        console.log(`✨ DEZZER PARSER | albumLink: ${albumLink}`);
        if(albumLink) return {
            source: 'deezer',
            type: 'album',
            link: `https://www.deezer.com${albumLink}`
        }

        await page.goto(`https://www.deezer.com/search/${group} - ${album}/track`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);

        await page.screenshot({ path: 'deezer1.jpg' });
        console.log(`✨ DEZZER PARSER | track page loaded... (https://www.deezer.com/search/${group} - ${album}/track)`);

        const trackLink = await findTrack(page, group, album);
        if(trackLink) return {
            source: 'deezer',
            type: 'track',
            link: `https://www.deezer.com${trackLink}`
        }

        return {
            error: `Album not found ${group} - ${album}`
        };
    } catch(e) {
        return { source: 'deezer', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ DEZZER PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `deezer | ${group} | ${album}` });
    if(prevResult) console.log('🌼 MONGO DB | DEEZER PARSER: return prev result...');
    if(prevResult && !prevResult.link.includes('search?')) return prevResult;

    const response = await parsePage(browser, group, album);

    console.log('✨ DEZZER PARSER:END', response);
    return response;
}

module.exports = start;