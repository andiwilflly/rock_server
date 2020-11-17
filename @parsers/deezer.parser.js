

async function findAlbum(page, group, album) {
    return await page.evaluate((_group, _album)=> {
        const $albumTitle = [...document.querySelectorAll('.heading-2.search-title')].find($title =>  $title.innerText.includes('Albums'));
        if(!$albumTitle) return null;

        const $albums = [...$albumTitle.parentElement.querySelectorAll('.thumbnail-col')];
        if(!$albums.length) return null;

        return $albums.find($album => {
            const albumName = $album.querySelector('.heading-4').innerText.toLowerCase();
            const groupName = $album.querySelector('.heading-4-sub a').innerText.toLowerCase();

            if(!albumName.includes(_album)) return null;
            if(!groupName.includes(_group)) return null;

            return true;
        }).querySelector('.heading-4 a').getAttribute('href');
    }, group, album);
}


async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://www.deezer.com/search/${group} - ${album}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ DEZZER PARSER | page loaded...`);

        try { await page.click('.cookie-btn'); } catch {}

        const albumLink = await findAlbum(page, group, album);

        console.log(`✨ DEZZER PARSER | albumLink: ${albumLink}`);
        if(albumLink) return {
            source: 'https://www.deezer.com',
            type: 'album',
            link: `https://www.deezer.com${albumLink}`
        }

        // await page.focus('#login_mail')
        // await page.keyboard.type(login);
        //
        // await page.focus('#login_password')
        // await page.keyboard.type(pass);
        //
        // await page.waitFor(3000);
        // // await page.click('#login_form_submit');
        // await page.evaluate((selector) => document.querySelector('#login_form_submit').click());
        //
        // await page.waitFor(30000);

        return {
            error: `Album not found ${group} - ${album}`
        };
    } catch(e) {
        return { source: 'https://www.deezer.com', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ DEZZER PARSER:START...');

    const response = await parsePage(browser, group, album);

    console.log('✨ DEZZER PARSER:END', response);
    return response;
}

module.exports = start;