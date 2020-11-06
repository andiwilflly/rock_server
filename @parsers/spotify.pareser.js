const fetch = require("node-fetch");
const login =  'andiwillfly@gmail.com';
const pass =  '121314ward';


async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://accounts.spotify.com/en/login`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ SPOTIFY PARSER | LOGIN page loaded...`);


        await page.focus('#login-username')
        await page.keyboard.type(login);

        await page.focus('#login-password')
        await page.keyboard.type(pass);

        await page.waitFor(3000);
        // await page.click('#login_form_submit');
        await page.evaluate(()=> document.querySelector('#login-button').click());
        await page.waitFor(2000);


        await page.goto(`https://open.spotify.com/search/${group}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
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
        await page.waitFor(100);
        console.log(`✨ SPOTIFY PARSER | GROUP '${group}' page loaded...`);

        return {
            source: 'https://play.google.com',
            link: `https://play.google.com${"groupLink"}`
        };
    } catch(e) {
        return { source: 'https://play.google.com', error: e.toString() };
    }
}


async function start(group, album) {
    console.log('✨ SPOTIFY PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `spotify | ${group} | ${album}` });
    if(prevResult) console.log('🌼 MONGO DB | SPOTIFY PARSER: return prev result...');
    if(prevResult) return prevResult;


    let matchedAlbum = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(`${group} - ${album}`)}&type=album,track&limit=1`, {
        headers: { 'Authorization': `Bearer ${global.SPOTIFY_TOKEN}` }
    });
    matchedAlbum = await matchedAlbum.json();

    matchedAlbum = (matchedAlbum.albums.items[0] || matchedAlbum.tracks.items[0]);

    if(!matchedAlbum) return {
        error: `Album [${group} - ${album}] not found`,
        source: 'spotify'
    }

    console.log('✨ SPOTIFY PARSER:END');
    return {
        link: matchedAlbum.external_urls.spotify,
        name: matchedAlbum.name,
        artistName: matchedAlbum.artists[0].name,
        artistLink: matchedAlbum.artists[0].external_urls.spotify,
        albumId: matchedAlbum.id,
        image: matchedAlbum.images ? matchedAlbum.images[0].url : '[No track image]',
        directTrackLink: matchedAlbum.preview_url,
        releaseDate: matchedAlbum.release_date,
        totalTracks: matchedAlbum.total_tracks,
        type: matchedAlbum.type,
        source: 'spotify'
    };
}

module.exports = start;