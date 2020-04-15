async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();
        await page.goto(`https://music.yandex.ua/search?text=${group}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(300);

        console.log(`✨ YANDEX PARSER | search groups page loaded...`);

        const artistLink = await page.evaluate((_group)=> {
            const $artistLink = [ ...document.querySelectorAll('.serp-snippet__artists > .artist .artist__name a') ]
                .find($artist => $artist.innerText === 'Asking Alexandria');

            return $artistLink ? $artistLink.getAttribute('href') : null;
        }, group);

        if(!artistLink) return { error: `No such group: ${group}` };

        console.log(`✨ YANDEX PARSER | find artistLink: https://music.yandex.ua${artistLink}...`);

        await page.goto(`https://music.yandex.ua${artistLink}/albums`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(500);


        const albumLink = await page.evaluate((_album)=> {
            const $album = [...document.querySelector('.page-artist__albums').querySelectorAll('.album')]
                .find($artist => $artist.querySelector('.album__title.typo-main').innerText === 'Down To Hell');

            return $album ? $album.querySelector('a').getAttribute('href') : null;
        }, album)

        if(!albumLink) return { error: `No such album: ${album}` };

        console.log('✨ YANDEX ENTER page', `https://music.yandex.ua${albumLink}`);

        return {
            source: 'https://music.yandex.ua',
            link: `https://music.yandex.ua${albumLink}`
        };

    } catch(e) {
        return { error: e };
    }
}


async function start(browser, group, album) {
    console.log('✨ YANDEX PARSER:START...');

    const response = await parsePage(browser, group, album);
    browser.close();

    console.log('✨ YANDEX PARSER:END', response);
    return response;
}

module.exports = start;