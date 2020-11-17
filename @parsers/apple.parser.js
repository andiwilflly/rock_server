const setupPage = require('../server/utils/setupPage.utils');


async function waitForPage(page, iteration) {
    if(iteration > 5) return;
    console.log('APPLE PARSER | waiting page... ', iteration, page.url());
    await page.waitFor(1500);
    return page.url().includes('search?') ? await waitForPage(page, iteration+1) : page.url();
}


async function parsePage(browser, group, album) {
    try {
        const page = await setupPage(browser);

        await page.goto(`https://music.apple.com/us/search?term=${encodeURIComponent(`${group.replace(/'/g, '').split(' ').join('+')} - ${album.replace(/'/g, '').split(' ').join('+')}`)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        console.log(`✨ APPLE PARSER | page loaded...`, `https://music.apple.com/us/search?term=${encodeURIComponent(`${group.replace(/'/g, '').split(' ').join('+')} - ${album.replace(/'/g, '').split(' ').join('+')}`)}`);


        const isFound = await page.evaluate((_group, _album)=> {
            const $albumOrSongEl = [...document.querySelectorAll('.shelf-grid__list .shelf-grid__list-item .linkable')]
                .find($el => $el.innerText.toLowerCase().includes(_group) && $el.innerText.toLowerCase().startsWith(_album))
            const isFound = !!$albumOrSongEl;
            if($albumOrSongEl) $albumOrSongEl.click();
            return isFound;
        }, group, album);

        await waitForPage(page, 1);

        if(!isFound) return {
            source: 'apple',
            error: `Not found ${group} - ${album}`
        }

        return {
            source: 'apple',
            link: `${page.url()}`.replace('beta.', '')
        };

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
