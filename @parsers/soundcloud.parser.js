// const Soundcloud = require("soundcloud.ts").default;


async function parsePage(browser, group, song) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://soundcloud.com/search?q=${encodeURIComponent(`${group} - ${song}`)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ SOUNDCLOUD PARSER | page loaded...`, `https://soundcloud.com/search/sounds?q=${encodeURIComponent(`${group} - ${song}`)}`);

        const songLink = await page.evaluate((_song, _group)=> {
            const $songLink = [...document.querySelectorAll('.searchList__item a')]
                .find($link => $link.innerText.toLowerCase().includes(_song));

            const $groupLink = [...document.querySelectorAll('.searchList__item a')]
                .find($link => $link.innerText.toLowerCase().includes(_group));

            if(!$groupLink) return 0;
            return $songLink ? $songLink.getAttribute('href') : null
        }, song, group);
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

   //  const soundcloud = new Soundcloud();
   //  // playlist
   //  let matchedSong = await soundcloud.tracks.scrape(`${encodeURIComponent(`${group}-${album}`)}`);
   //
   // matchedSong = matchedSong[0];
   //
   //  if(
   //      !matchedSong
   //  ) {
   //      return {
   //          error: `Not found (${group} - ${album})`,
   //          source: 'soundcloud'
   //      }
   //  }
   //
   //  console.log('✨ SOUNDCLOUD PARSER:END');
   //  return {
   //      authorImage: (matchedSong.user.visuals && matchedSong.user.visuals[0]) ?
   //          matchedSong.user.visuals.visuals[0].visual_url
   //          :
   //          matchedSong.user.avatar_url,
   //      authorDescription: matchedSong.user.description,
   //      title: matchedSong.title,
   //      link: matchedSong.permalink_url,
   //      description: matchedSong.description,
   //      tags: matchedSong.tag_list.split(' ').filter(Boolean),
   //      genre: matchedSong.genre,
   //      type: matchedSong.kind,
   //      image: matchedSong.artwork_url,
   //      createdAt: matchedSong.created_at,
   //      releaseDate: matchedSong.release_date || 'Unknown',
   //      source: 'soundcloud'
   //  };
}

module.exports = start;