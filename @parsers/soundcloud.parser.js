// const Soundcloud = require("soundcloud.ts").default;


async function newSearch(page, group, song, url) {
    await page.goto(`${url}?q=${encodeURIComponent(`${group} - ${song}`)}`, {
        waitUntil: 'networkidle0'
    });
    await page.waitForTimeout(100);
    console.log(`✨ SOUNDCLOUD PARSER | new search...`, `https://soundcloud.com/search?q=${encodeURIComponent(`${group} - ${song}`)}`);

    return page.evaluate((_song, _group)=> {
        const $songLink =  [...document.querySelectorAll('.searchList__item')]
            .find($item => {
                const group = $item.querySelector('.soundTitle__usernameText').innerText.toLowerCase();
                const song = $item.querySelector('.soundTitle__title').innerText.toLowerCase();
                const matchSong = song.startsWith(_song);
                const matchGroup = group.startsWith(_group);
                return matchSong && matchGroup;
            });
        return $songLink ? $songLink.querySelector('a').getAttribute('href') : null
    }, song, group);
}

async function search(page, group, song, url) {
    await page.goto(`${url}?q=${encodeURIComponent(`${group} - ${song}`)}`, {
        waitUntil: 'networkidle0'
    });
    await page.waitForTimeout(100);
    console.log(`✨ SOUNDCLOUD PARSER | page loaded...`, `https://soundcloud.com/search?q=${encodeURIComponent(`${group} - ${song}`)}`);

    return page.evaluate((_song, _group)=> {
        const $songLink = [...document.querySelectorAll('.searchList__item a')]
            .find($link => {
                const text = $link.innerText.toLowerCase().replace(/’/g, '');
                const matchSong = text.includes(_song);
                const matchGroup = text.includes(_group);
                return matchSong && matchGroup;
            });
        return $songLink ? $songLink.getAttribute('href') : null
    }, song, group);
}

async function parsePage(browser, group, song) {
    try {
        const page = await browser.newPage();

        let songLink = await newSearch(page, group, song, 'https://soundcloud.com/search/albums');
        if(!songLink) songLink = await newSearch(page, group, song, 'https://soundcloud.com/search');
        if(!songLink) songLink = await search(page, group, song, 'https://soundcloud.com/search/albums');
        if(!songLink) songLink = await search(page, group, song, 'https://soundcloud.com/search');

        if(songLink === 0) return { source: 'soundcloud', error: `Song is found, buy group '${group}' is not` };
        if(!songLink) return { source: 'soundcloud', error: `Can't find '${group} - ${song}'` };

        return {
            source: 'soundcloud',
            link: `https://soundcloud.com${songLink}`
        };
    } catch(e) {
        return { source: 'soundcloud', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ SOUNDCLOUD PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `soundcloud | ${group} | ${album}` });
    if(prevResult) console.log('🌼 MONGO DB | SOUNDCLOUD PARSER: return prev result...');
    if(prevResult) return prevResult;

    return await parsePage(browser, group, album);
}

module.exports = start;
