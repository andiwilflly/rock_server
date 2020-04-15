async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();
        await page.goto(`https://play.google.com/store/search?q=${group.split(' ').join('+')}&c=music`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(3000);
        console.log(`✨ GOOGLE PARSER | page loaded...`);

        const albumsPageLink = await page.evaluate(()=> {
            const $albumsShowMoreBtn = [...document.querySelectorAll('.sv0AUd.bs3Xnd')]
                .find($title => $title.innerText === 'Альбоми' || $title.innerText === 'Albums')
                .parentElement.parentElement.parentElement.parentElement
                .querySelector('.W9yFB a');

            return $albumsShowMoreBtn ? $albumsShowMoreBtn.getAttribute('href') : null;
        });
        if(!albumsPageLink) return { error: `Can't open albums page` };
        console.log(`✨ GOOGLE PARSER | albums page link received... ${albumsPageLink}`);

        // Albums page
        await page.goto(`https://play.google.com${albumsPageLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(3000);
        console.log(`✨ GOOGLE PARSER | albums page loaded...`);

        const albumLink = await page.evaluate((_album)=> {
            const $albumLink = [...document.querySelectorAll('.ImZGtf.mpg5gc .b8cIId a')]
                .find($title => $title.innerText.includes(_album));

            return $albumLink ? $albumLink.getAttribute('href') : null;
        }, album);
        if(!albumLink) return { error: `Can't find album ${album}` };
        console.log(`✨ GOOGLE PARSER | album link received... ${albumLink}`);


        // Album page
        await page.goto(`https://play.google.com${albumLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(300);
        console.log(`✨ GOOGLE PARSER | album page loaded...`);

        const albumImg = await page.evaluate(()=> {
            const $img = document.querySelector('.hkhL9e img')
            return $img ? $img.getAttribute('src') : null
        });

        return {
            source: 'https://play.google.com',
            link: `https://play.google.com${albumLink}`,
            albumImg: `${albumImg}`
        };
    } catch(e) {
        return { error: e };
    }
}


async function start(browser, group, album) {
    console.log('✨ GOOGLE PARSER:START...');

    const response = await parsePage(browser, group, album);

    console.log('✨ GOOGLE PARSER:END', response);
    return response;
}

module.exports = start;