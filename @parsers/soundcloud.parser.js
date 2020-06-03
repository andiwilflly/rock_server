const Soundcloud = require("soundcloud.ts").default;
const parserStore = require('data-store')({ path: process.cwd() + '/DB/parserStore.json' });


async function parsePage(browser, group, song) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://soundcloud.com/search/sounds?q=${encodeURIComponent(`${song}`)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ SOUNDCLOUD PARSER | page loaded...`);

        const songLink = await page.evaluate((_song)=> {
            const $songLink = [...document.querySelectorAll('.searchList__item a')]
                .find($link => $link.innerText.toLowerCase().includes(_song));
            return $songLink ? $songLink.getAttribute('href') : null
        }, song);
        if(!songLink) return { source: 'soundcloud', error: `Can't find song ${song}` };

        return {
            source: 'soundcloud',
            link: `https://soundcloud.com${songLink}`
        };
    } catch(e) {
        return { source: 'soundcloud', error: e.toString() };
    }
}


async function start(group, album) {
    console.log('✨ SOUNDCLOUD PARSER:START...');


    console.log(parserStore.get(`soundcloud.${group}.${album}`), 'wtf?', `soundcloud.${group}.${album}`);
    // Cache
    if(parserStore.get(`soundcloud.${group}.${album}`)) console.log('🆘 SOUNDCLOUD PARSER: RETURN CACHE...');
    if(parserStore.get(`soundcloud.${group}.${album}`)) return parserStore.get(`soundcloud.${group}.${album}`);


    const soundcloud = new Soundcloud();
    // playlist
    let matchedSong = await soundcloud.tracks.scrape(`${encodeURIComponent(`${group}-${album}`)}`);

   matchedSong = matchedSong[0];

    if(
        !matchedSong
    ) {
        return {
            error: `Not found (${group} - ${album})`,
            source: 'soundcloud'
        }
    }

    console.log('✨ SOUNDCLOUD PARSER:END');
    return {
        authorImage: (matchedSong.user.visuals && matchedSong.user.visuals[0]) ?
            matchedSong.user.visuals.visuals[0].visual_url
            :
            matchedSong.user.avatar_url,
        authorDescription: matchedSong.user.description,
        title: matchedSong.title,
        link: matchedSong.permalink_url,
        description: matchedSong.description,
        tags: matchedSong.tag_list.split(' ').filter(Boolean),
        genre: matchedSong.genre,
        type: matchedSong.kind,
        image: matchedSong.artwork_url,
        createdAt: matchedSong.created_at,
        releaseDate: matchedSong.release_date || 'Unknown',
        source: 'soundcloud'
    };
}

module.exports = start;