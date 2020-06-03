const setupPage = require('../server/utils/setupPage.utils');


async function parsePage(browser, group, album) {
    try {
        const page = await setupPage(browser);

        // https://music.apple.com/us/search?searchIn=am&term=Asking%20alexandria%20-%20down%20to%20hell
        await page.goto(`https://music.apple.com/us/search?term=${encodeURIComponent(`${group} - ${album}`)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        console.log(`✨ APPLE PARSER | page loaded...`);


        let albumPageLink = await page.evaluate((_album)=> {
            const $albumPageLink = [...document.querySelectorAll('[aria-label="Albums"] .shelf-grid__list-item .lockup__name')]
                .find($name => $name.innerText.toLowerCase().includes(_album));

            return $albumPageLink ? $albumPageLink.getAttribute('href') : null;
        }, album);


        await page.waitFor(1000);
        // Find song
        console.log(`✨ APPLE PARSER | trying to find song ${album}...`,);
        if(!albumPageLink) {
            let albumPageBtn = await page.evaluate((_album)=> {
                const $albumPageBtn = [...document.querySelectorAll('[aria-label="Songs"] .shelf-grid__list-item .song')]
                    .find($item => $item.innerText.toLowerCase().includes(_album));
                $albumPageBtn ? $albumPageBtn.click() : null;

                return !!$albumPageBtn;
            }, album);

            console.log(`✨ APPLE PARSER | albumPageBtn...`, albumPageBtn);

            if(albumPageBtn) await page.waitFor(1000);
            if(albumPageBtn) albumPageLink = page.url();
            if(albumPageBtn) console.log(`✨ APPLE PARSER | albumPageBtn clicked...`, page.url());
        }

        // await page.waitFor(10000);

        // Try to search in artist page
        if(!albumPageLink) {
            const groupPageLink = await page.evaluate((_group)=> {
                const $groupPageLink = [...[...document.querySelectorAll('h2')]
                    .find($title => $title.innerText.includes('Artists'))
                    .parentElement.parentElement
                    .querySelectorAll('.shelf-grid__list-item')]
                    .find($item => $item.innerText.toLowerCase().includes(_group));

                return $groupPageLink ? $groupPageLink.querySelector('a').getAttribute('href') : null;
            }, group);
            console.log(`✨ APPLE PARSER | groupPageLink received... ${groupPageLink}`);

            if(groupPageLink) {
                await page.goto(`${groupPageLink}#see-all/full-albums`, {
                    waitUntil: 'networkidle2'
                });
                await page.waitFor(100);
                console.log(`✨ APPLE PARSER | ${group} page loaded...`);

                albumPageLink = await page.evaluate((_album)=> {
                    const $albumPageLink = [...document.querySelectorAll('.lockup__lines a')].find(x => x.innerText.toLowerCase().includes(_album))
                    return $albumPageLink ? $albumPageLink.getAttribute('href') : null
                }, album);
            }
        }

        if(!albumPageLink) await page.close();
        if(!albumPageLink) return { source: 'apple', error: `Can't find album: ${album}` };

        console.log(`✨ APPLE PARSER | albums page link received... ${albumPageLink}`);

        await page.close();
        return {
            source: 'apple',
            link: `${albumPageLink}`.replace('beta.', '')
        };
    } catch(e) {
        return { source: 'apple', error: e.toString() };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album) {
    console.log('✨ APPLE PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `apple.${group}.${album}` });
    if(prevResult) console.log('🌼 MONGO DB | APPLE PARSER: return prev result...');
    if(prevResult) return prevResult;

    const response = await parsePage(browser, group, album);

    console.log('✨ APPLE PARSER:END', response);
    return response;
}

module.exports = start;
