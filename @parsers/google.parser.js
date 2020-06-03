const setupPage = require('../server/utils/setupPage.utils');


async function parsePage(browser, group, album) {
    try {
        const page = await setupPage(browser);

        await page.goto(`https://play.google.com/store/search?q=${group.split(' ').join('+')}&c=music`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ GOOGLE PARSER | page loaded...`);

        const albumsPageLink = await page.evaluate(()=> {
            const $albumsShowMoreBtn = [...document.querySelectorAll('.sv0AUd.bs3Xnd')]
                .find($title => $title.innerText === 'Альбоми' || $title.innerText === 'Albums')
                .parentElement.parentElement.parentElement.parentElement
                .querySelector('.W9yFB a');

            return $albumsShowMoreBtn ? $albumsShowMoreBtn.getAttribute('href') : null;
        });
        if(!albumsPageLink) await page.close();
        if(!albumsPageLink) return { source: 'google', error: `Can't open albums page` };
        console.log(`✨ GOOGLE PARSER | albums page link received... ${albumsPageLink}`);

        // Albums page
        await page.goto(`https://play.google.com${albumsPageLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ GOOGLE PARSER | albums page loaded...`);

        const albumLink = await page.evaluate((_album)=> {
            const $albumLink = [...document.querySelectorAll('.ImZGtf.mpg5gc .b8cIId a')]
                .find($title => $title.innerText.toLowerCase().includes(_album));

            return $albumLink ? $albumLink.getAttribute('href') : null;
        }, album);
        if(!albumLink) await page.close();
        if(!albumLink) return { source: 'google', error: `Can't find album ${album}` };
        console.log(`✨ GOOGLE PARSER | album link received... ${albumLink}`);


        await page.goto(`https://play.google.com${albumLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ GOOGLE PARSER | album page loaded...`);

        const copyright = await page.evaluate(()=> document.querySelectorAll('.ZVWMWc .UAO9ie')[3].innerText);

        await page.close();
        return {
            source: 'google',
            link: `https://play.google.com${albumLink}`,
            copyright
        };
    } catch(e) {
        return { source: 'google', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ GOOGLE PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `google.${group}.${album}` });
    if(prevResult) console.log('🌼 MONGO DB | GOOGLE PARSER: return prev result...');
    if(prevResult) return prevResult;

    const response = await parsePage(browser, group, album);

    console.log('✨ GOOGLE PARSER:END', response);
    return response;
}

module.exports = start;
