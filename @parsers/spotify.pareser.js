const fetch = require("node-fetch");
const login =  'andiwillfly@gmail.com';
const pass =  '121314ward';
const translit = require("../server/utils/translit");


async function parsePageOld(browser, group, album) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://accounts.spotify.com/en/login`, {
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(100);
        console.log(`✨ SPOTIFY PARSER | LOGIN page loaded...`);


        await page.focus('#login-username')
        await page.keyboard.type(login);

        await page.focus('#login-password')
        await page.keyboard.type(pass);

        await page.waitForTimeout(3000);
        // await page.click('#login_form_submit');
        await page.evaluate(()=> document.querySelector('#login-button').click());
        await page.waitForTimeout(2000);


        await page.goto(`https://open.spotify.com/search/${group}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(1000);
        console.log(`✨ SPOTIFY PARSER | search page loaded...`);


        const groupLink = await page.evaluate((_group)=> {
            const $groupLink = [...document.querySelector('[aria-label="Artists"]').querySelectorAll('a')]
                .find($link => $link.innerText.toLowerCase().includes(group));
            return $groupLink ? $groupLink.getAttribute('href') : null;
        }, group);
        if(!groupLink) return { source: 'https://open.spotify.com', error: `Can't find group ${group}` };


        await page.goto(`https://open.spotify.com${groupLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(100);
        console.log(`✨ SPOTIFY PARSER | GROUP '${group}' page loaded...`);

        return {
            source: 'https://play.google.com',
            link: `https://play.google.com${"groupLink"}`
        };
    } catch(e) {
        return { source: 'https://play.google.com', error: e.toString() };
    }
}

async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://open.spotify.com/search/${group}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(500);
        const trGroup = translit(group);
        const artistLink = await page.evaluate((_group, _trGroup)=> {
            const artistEl = [...document.querySelectorAll('a.f7ebc3d96230ee12a84a9b0b4b81bb8f-scss')]
                .find($el =>
                    (($el.innerText.toLowerCase() === _group || $el.getAttribute('title') && $el.getAttribute('title').toLowerCase() === _group)
                    || ($el.innerText.toLowerCase() == _trGroup || $el.getAttribute('title').toLowerCase() == _trGroup))
                    && $el.getAttribute('href') && $el.getAttribute('href').includes('artist/')
                );
            if(!artistEl) return null;
            return artistEl.getAttribute('href');
        }, group, trGroup);
        if (!artistLink) {
            return {
                source: 'spotify',
                error: `Group not found: ${group}`
            };
        }

        await page.goto(`https://open.spotify.com${artistLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitForTimeout(500);

        const albumLink = await page.evaluate((_album)=> {
            const albumtEl = [...document.querySelectorAll('a.f7ebc3d96230ee12a84a9b0b4b81bb8f-scss')]
                .find($el =>
                    ($el.innerText.toLowerCase().includes(_album) ||
                    $el.getAttribute('title') && $el.getAttribute('title').toLowerCase().includes(_album))
                    && $el.getAttribute('href') && $el.getAttribute('href').includes('album/')
                );

            if(!albumtEl) return null;
            return albumtEl.getAttribute('href');
        }, album);

        if(!albumLink) return { source: 'spotify', error: `Album not found:  ${group} -  ${album}` };

        return {
            source: 'spotify',
            link: `https://open.spotify.com${albumLink}`
        };
    } catch(e) {
        return { source: 'spotify', error: e.toString() };
    }
}

async function start(browser, group, album) {
    console.log('✨ SPOTIFY PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `spotify | ${group} | ${album}` });
    if(prevResult) console.log('🌼 MONGO DB | SPOTIFY PARSER: return prev result...');
    if(prevResult) return prevResult;

    //type=album,track
    let matchedAlbum = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(`${group} - ${album}`)}&type=album&limit=1`, {
        headers: { 'Authorization': `Bearer ${global.SPOTIFY_TOKEN}` }
    });
    matchedAlbum = await matchedAlbum.json();

    matchedAlbum = matchedAlbum.albums.items[0];// || matchedAlbum.tracks.items[0]);

    console.log('✨ SPOTIFY PARSER:END');

    if(!matchedAlbum) return await parsePage(browser, group, album);
    return {
        link: matchedAlbum.external_urls.spotify,
        name: matchedAlbum.name,
        artistName: matchedAlbum.artists[0].name,
        artistLink: matchedAlbum.artists[0].external_urls.spotify,
        albumId: matchedAlbum.id,
        image: matchedAlbum.images ? matchedAlbum.images[0].url : '[No track image]',//or matchedAlbum.album.images[0].url
        directTrackLink: matchedAlbum.preview_url,
        releaseDate: matchedAlbum.release_date,
        totalTracks: matchedAlbum.total_tracks,
        type: matchedAlbum.type,
        source: 'spotify'
    };
}

module.exports = start;
