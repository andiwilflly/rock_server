const Soundcloud = require('soundcloud.ts').default;


async function fetchFromApi(group, album) {
    const sc = new Soundcloud();
    const query = `${group} ${album}`;
    const groupLower = group.toLowerCase();
    const albumLower = album.toLowerCase();

    const playlistResults = await sc.playlists.search({ q: query });
    const playlists = playlistResults.collection || [];

    const playlistMatch =
        playlists.find(item =>
            item.title?.toLowerCase() === `${groupLower} – ${albumLower}` ||
            item.title?.toLowerCase() === `${groupLower} - ${albumLower}`
        ) ||
        playlists.find(item =>
            item.title?.toLowerCase().includes(albumLower) &&
            item.user?.username?.toLowerCase().includes(groupLower)
        );

    if (playlistMatch?.permalink_url) {
        const image = playlistMatch.artwork_url?.replace('-large.', '-t500x500.') || null;
        return {
            source: 'soundcloud',
            link: playlistMatch.permalink_url,
            ...(image && { image }),
        };
    }

    const trackResults = await sc.tracks.search({ q: query });
    const tracks = trackResults.collection || [];

    const trackMatch =
        tracks.find(item =>
            item.title?.toLowerCase() === `${groupLower} - ${albumLower}` &&
            item.user?.username?.toLowerCase().includes(groupLower)
        ) ||
        tracks.find(item =>
            item.title?.toLowerCase().includes(albumLower) &&
            item.user?.username?.toLowerCase().includes(groupLower)
        );

    if (trackMatch?.permalink_url) {
        const image = trackMatch.artwork_url?.replace('-large.', '-t500x500.') || null;
        return {
            source: 'soundcloud',
            link: trackMatch.permalink_url,
            ...(image && { image }),
        };
    }

    return { source: 'soundcloud', error: `Not found via API: ${group} - ${album}` };
}


async function newSearch(page, group, song, url) {
    await page.goto(`${url}?q=${encodeURIComponent(`${group} - ${song}`)}`, {
        waitUntil: 'networkidle0'
    });
    await new Promise(r => setTimeout(r, 100));
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
    await new Promise(r => setTimeout(r, 100));
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
    const page = await browser.newPage();
    try {
        page.setDefaultNavigationTimeout(50000);

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
    } finally {
        await page.close().catch(() => {});
    }
}


async function start(browser, group, album) {
    console.log('✨ SOUNDCLOUD PARSER:START...');
    const response = await fetchFromApi(group, album);
    console.log('✨ SOUNDCLOUD PARSER:END', response);
    return response;
}

module.exports = start;
