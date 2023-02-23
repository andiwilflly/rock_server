

async function findAlbum(page, group, album) {
    return await page.evaluate((_group, _album)=> {
        let $albumTitle = [...document.querySelectorAll('.heading-2.search-title')].find($title =>  $title.innerText.includes('Albums'));
        if (!$albumTitle)
            $albumTitle = [...document.querySelectorAll('.thumbnail-grid-title.heading-1 ')].find($title =>  $title.innerText.includes('album'));

        if(!$albumTitle) return null;

        const $albums = [...$albumTitle.parentElement.querySelectorAll('.thumbnail-col')];
        if(!$albums.length) return null;

        const $album = $albums.find($album => {
            //TODO there are no these selectors anymore .heading-4 and .heading-4-sub
            let albumName = $album.querySelector('.heading-4');
            let groupName = $album.querySelector('.heading-4-sub a');
            if (albumName) {
                albumName = albumName.innerText.toLowerCase();
            }
            if (groupName) {
                groupName = albumName.innerText.toLowerCase();
            }

            if(!albumName || !albumName.includes(_album)) return null;
            if(!groupName || !groupName.includes(_group)) return null;

            return true;
        });

        if (!$album) return null
        return $album.querySelector('.heading-4 a').getAttribute('href')
    }, group, album);
}


async function findTrack(page, group, album) {
    return await page.evaluate((_group, _album)=> {
        const $rows = [...document.querySelectorAll('._2OACy')];

        const rows = $rows.map($row => {
            let $cells = [...$row.querySelectorAll('._1R22u')];
            let $trackCell = $cells.find($cell => $cell.innerText.toLowerCase().includes(_album.toLowerCase()));
            if(!$trackCell) {
                $cells = [...$row.querySelectorAll('.jYj4D')];
                $trackCell = $cells.find($cell => $cell.innerText.toLowerCase().includes(_album.toLowerCase()));
            }
            if(!$trackCell) return null;
            return ($row.querySelector('.jYj4D a')) ? $row.querySelector('.jYj4D a').getAttribute('href') : null;
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
        await page.waitForTimeout(3000);
        console.log(`✨ DEZZER PARSER | page loaded...`);

        try { await page.click('.cookie-btn'); } catch {}
        try { await page.click('#gdpr-btn-accept-all'); } catch {}
        await page.waitForTimeout(3000);
        const albumLink = await findAlbum(page, group, album);
        console.log(`✨ DEZZER PARSER | albumLink: ${albumLink}`);
        if(albumLink) {
            await page.goto(`https://www.deezer.com${albumLink}`, {
                waitUntil: 'networkidle2'
            });
            await page.waitForTimeout(4000);
            let img = '';
            try {
                img = await page.evaluate(() => {
                    return document.querySelector('img.css-1phd9a0').getAttribute('src');
                });
            } catch {}

            return {
                source: 'deezer',
                type: 'album',
                link: `https://www.deezer.com${albumLink}`,
                image: img.replace(/\d+x\d+/, '800x800'),
            }
        }

        await page.goto(`https://www.deezer.com/search/${group} - ${album}/track`, {
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(3000);

        //await page.screenshot({ path: 'deezer1.jpg' });
        console.log(`✨ DEZZER PARSER | track page loaded... (https://www.deezer.com/search/${group} - ${album}/track)`);

        const trackLink = await findTrack(page, group, album);
        if(trackLink) {
            await page.goto(`https://www.deezer.com${trackLink}`, {
                waitUntil: 'networkidle2'
            });
            await page.waitForTimeout(3000);

            let img = '';
            try {
                img = await page.evaluate(() => {
                    return document.querySelector('img.css-1phd9a0').getAttribute('src');
                });
            } catch {}

            return {
                source: 'deezer',
                type: 'track',
                link: `https://www.deezer.com${trackLink}`,
                image: img.replace(/\d+x\d+/, '800x800'),
            }
        }
        return {
            source: 'deezer',
            error: `Album not found https://www.deezer.com/search/${encodeURIComponent(`${group} - ${album}`)}`
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
