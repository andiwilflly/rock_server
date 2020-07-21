const setupPage = require('../server/utils/setupPage.utils');


async function newParser(page, group, album) {
    console.log(`✨ YANDEX PARSER | RUN NEW PARSER... (step 1)`);

    let link = await page.evaluate((_group, _album)=> {
        const $link = [ ...document.querySelectorAll('.album .album__title') ]
            .find($artist => $artist.innerText.toLowerCase().startsWith(_album));

        if(!$link) return null;

        // Author is not the same
        const author = $link.parentNode.querySelector('.album__artist').innerText;
        if(!author.toLowerCase().includes(_group)) return null;

        return $link.querySelector('a').getAttribute('href');
    }, group, album);

    console.log(`✨ YANDEX PARSER | (step 2)`, link);

    if(!link) link = await page.evaluate((_group, _album)=> {
        const $link = [ ...document.querySelectorAll('.d-track .d-track__name a') ]
            .find($artist => $artist.innerText.toLowerCase().startsWith(_album));

        if(!$link) return null;

        // Author is not the same
        const author = $link.parentNode.parentNode.querySelector('.d-track__meta').innerText;
        if(!author.toLowerCase().includes(_group)) return null;

        return $link.getAttribute('href');
    }, group, album);

    console.log(`✨ YANDEX PARSER | (step 3)`, link);

    if(link) {
        // Album page
        await page.goto(`https://music.yandex.ua${link}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        await page.$eval('.entity-cover__image', ($el)=> $el.click());

        let albumImg = '';
        try {
           albumImg = await page.evaluate(()=> document.querySelector('.cover-popup__item.cover-popup__cover').getAttribute('src'));
        } catch {}

        return {
            source: 'yandex',
            link: `https://music.yandex.ua${link}`,
            image: albumImg.replace('//', 'https://')
        };
    } else {
        return { source: 'yandex', error: `No such album: ${album}` };
    }
}


async function parsePage(browser, group, album) {
    try {
        const page = await setupPage(browser);

        await page.goto(`https://music.yandex.ua/search?text=${encodeURIComponent(group)} - ${encodeURIComponent(album)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);

        console.log(`✨ YANDEX PARSER | search groups page loaded...`, `https://music.yandex.ua/search?text=${group} - ${album}`);

        // Try new parser first...
        const result = await newParser(page, group, album);
        if(!result.error) return result;

        console.log(`✨ YANDEX PARSER | RUN OLD PARSER...`);


        await page.goto(`https://music.yandex.ua/search?text=${encodeURIComponent(group)} - ${encodeURIComponent(album)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);


        const artistLink = await page.evaluate((_group)=> {
            const $artistLink = [ ...document.querySelectorAll('.serp-snippet__artists > .artist .artist__name a') ]
                .find($artist => $artist.innerText.toLowerCase().includes(_group));

            return $artistLink ? $artistLink.getAttribute('href') : null;
        }, group);

        if(!artistLink) await page.close();
        if(!artistLink) return { source: 'yandex', error: `No such group: ${group}` };

        console.log(`✨ YANDEX PARSER | find artistLink: https://music.yandex.ua${artistLink}...`);

        await page.goto(`https://music.yandex.ua${artistLink}/albums`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);


        const albumLink = await page.evaluate((_album)=> {
            const $album = [...document.querySelector('.page-artist__albums').querySelectorAll('.album')]
                .find($artist => $artist.querySelector('.album__title.typo-main').innerText.toLowerCase().startsWith(_album));

            return $album ? $album.querySelector('a').getAttribute('href') : null;
        }, album)

        if(!albumLink) await page.close();
        if(!albumLink) return { source: 'yandex', error: `No such album: ${album}` };

        console.log('✨ YANDEX ENTER page', `https://music.yandex.ua${albumLink}`);


        // Album page
        await page.goto(`https://music.yandex.ua${albumLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        await page.$eval('.entity-cover__image', ($el)=> $el.click());
        const albumImg = await page.evaluate(()=> document.querySelector('.cover-popup__item.cover-popup__cover').getAttribute('src'));


        await page.close();
        return {
            source: 'yandex',
            link: `https://music.yandex.ua${albumLink}`,
            image: albumImg.replace('//', 'https://')
        };

    } catch(e) {
        return { source: 'yandex', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ YANDEX PARSER:START...');

    // Cache
    const prevResult = await global.MONGO_COLLECTION_PARSER.findOne({ _id: `yandex | ${group} | ${album}` });
    if(prevResult) console.log('🌼 MONGO DB | YANDEX PARSER: return prev result...');
    if(prevResult) return prevResult;


    const response = await parsePage(browser, group, album);

    console.log('✨ YANDEX PARSER:END', response);
    return response;
}

module.exports = start;

