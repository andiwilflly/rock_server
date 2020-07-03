const setupPage = require('../server/utils/setupPage.utils');


async function parsePage(browser, group, album) {
    try {
        const page = await setupPage(browser);

        await page.goto(`https://music.apple.com/us/search?term=${encodeURIComponent(`${group.replace(/'/g, '')} - ${album.replace(/'/g, '')}`)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        console.log(`✨ APPLE PARSER | page loaded...`, `https://music.apple.com/us/search?term=${encodeURIComponent(`${group} - ${album}`)}`);


        const isFound = await page.evaluate((_group, _album)=> {
            const $albumOrSongEl = [...document.querySelectorAll('.shelf-grid__list .shelf-grid__list-item .linkable')]
                .find($el => $el.innerText.toLowerCase().includes(_group) && $el.innerText.toLowerCase().startsWith(_album))
            const isFound = !!$albumOrSongEl;
            if($albumOrSongEl) $albumOrSongEl.click();
            return isFound;
        }, group, album);

        console.log('APPLE PARSER | isFound0: ', isFound, page.url());
        await page.waitFor(1500);
        console.log('APPLE PARSER | isFound1: ', isFound, page.url());
        await page.waitFor(1500);
        console.log('APPLE PARSER | isFound2: ', isFound, page.url());
        await page.waitFor(1500);
        console.log('APPLE PARSER | isFound3: ', isFound, page.url());

        if(!isFound) return {
            source: 'apple',
            error: `Not found ${group} - ${album}`
        }

        return {
            source: 'apple',
            link: `${page.url()}`.replace('beta.', '')
        };


        // TODO: Old
        // let albumPageLink = await page.evaluate((_album)=> {
        //     const $albumPageLink = [...document.querySelectorAll('[aria-label="Albums"] .shelf-grid__list-item .lockup__name')]
        //         .find($name => $name.innerText.toLowerCase().startsWith(_album));
        //
        //     return $albumPageLink ? $albumPageLink.getAttribute('href') : null;
        // }, album);
        //
        //
        // await page.waitFor(1500);
        //
        // // Find song
        // console.log(`✨ APPLE PARSER | trying to find song ${album}...`,);
        //
        // // Try to search in artist page
        // if(!albumPageLink) {
        //     let songPageLink = await page.evaluate((_album)=> {
        //         const $songPageBtn = [...document.querySelectorAll('[aria-label="Songs"] .list-lockup-track-content')]
        //             .find($name => $name.innerText.toLowerCase().startsWith(_album));
        //
        //         const isBtn = !!$songPageBtn;
        //         if($songPageBtn) $songPageBtn.click();
        //         return isBtn;
        //     }, album);
        //
        //     await page.waitFor(2000);
        //     console.log(`✨ APPLE PARSER | trying to find songPageLink ${songPageLink}...`, page.url());
        //
        //     if(songPageLink) {
        //         return {
        //             source: 'apple',
        //             link: `${page.url()}`.replace('beta.', '')
        //         };
        //     }
        //
        //     const groupPageLink = await page.evaluate((_group)=> {
        //         const $groupPageLink = [...[...document.querySelectorAll('h2')]
        //             .find($title => $title.innerText.includes('Artists'))
        //             .parentElement.parentElement
        //             .querySelectorAll('.shelf-grid__list-item')]
        //             .find($item => $item.innerText.toLowerCase().includes(_group));
        //
        //         return $groupPageLink ? $groupPageLink.querySelector('a').getAttribute('href') : null;
        //     }, group);
        //     console.log(`✨ APPLE PARSER | groupPageLink received... ${groupPageLink}`);
        //
        //     if(groupPageLink) {
        //         await page.goto(`${groupPageLink}#see-all/full-albums`, {
        //             waitUntil: 'networkidle2'
        //         });
        //         await page.waitFor(100);
        //         console.log(`✨ APPLE PARSER | ${group} page loaded...`);
        //
        //         albumPageLink = await page.evaluate((_album)=> {
        //             const $albumPageLink = [...document.querySelectorAll('.lockup__lines a')].find(x => x.innerText.toLowerCase().startsWith(_album))
        //             return $albumPageLink ? $albumPageLink.getAttribute('href') : null
        //         }, album);
        //     }
        // }
        //
        // if(!albumPageLink) await page.close();
        // if(!albumPageLink) return { source: 'apple', error: `Can't find album: ${album}` };
        //
        // console.log(`✨ APPLE PARSER | albums page link received... ${albumPageLink}`);
        //
        // await page.close();
        // if(albumPageLink.includes('search?')) return {
        //     source: 'apple',
        //     error: `Kakogo leshego opyat na posisk ssilka? ${albumPageLink}`
        // }
        // return {
        //     source: 'apple',
        //     link: `${albumPageLink}`.replace('beta.', '')
        // };
    } catch(e) {
        return { source: 'apple', error: e.toString() };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album) {
    console.log('✨ APPLE PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `apple | ${group} | ${album}` });
    if(prevResult) console.log('🌼 MONGO DB | APPLE PARSER: return prev result...');
    if(prevResult && !prevResult.link.includes('search?')) return prevResult;

    const response = await parsePage(browser, group, album);

    console.log('✨ APPLE PARSER:END', response);
    return response;
}

module.exports = start;
