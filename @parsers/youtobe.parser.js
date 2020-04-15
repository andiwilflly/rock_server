async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();
        await page.goto(`https://music.youtube.com/search?q=${encodeURIComponent(group)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(300);
        console.log(`✨ YOUTOBE PARSER | page loaded...`);


        // [...document.querySelectorAll('h2.title')].find($title => $title.innerText.includes('Виконавці')).parentElement.querySelector('#contents [aria-label="Asking Alexandria"]').getAttribute('href')

        const artistPageLink = await page.evaluate((_album)=> {
            const $artistPageLink = [...document.querySelectorAll('h2.title')]
                .find($title => $title.innerText.includes('Виконавці') || $title.innerText.includes('Artists'))
                .parentElement.querySelector('#contents [aria-label="Asking Alexandria"]');

            return $artistPageLink ? $artistPageLink.getAttribute('href') : null;
        }, album);
        if(!artistPageLink) return { error: `Can't find artistPageLink` };


        // Artist page
        await page.goto(`https://music.youtube.com/${artistPageLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(300);
        console.log(`✨ YOUTOBE PARSER | artist page loaded...`);


        const albumPageLink = await page.evaluate((_album)=> {
            let $albumPageLink = [...[...document.querySelectorAll('#contents h2')]
                .find($title => $title.innerText.includes('Альбоми')  || $title.innerText.includes('Albums'))
                .parentElement.parentElement
                .querySelectorAll('.carousel ytmusic-two-row-item-renderer')]
                .find($item => $item.querySelector('yt-formatted-string').innerText.includes("Down To Hell"));

            $albumPageLink = $albumPageLink || [...[...document.querySelectorAll('#contents h2')]
                .find($title => $title.innerText.includes('Сингли') || $title.innerText.includes('Singles'))
                .parentElement.parentElement
                .querySelectorAll('.carousel ytmusic-two-row-item-renderer')]
                .find($item => $item.querySelector('yt-formatted-string').innerText.includes("Down To Hell"));

            return $albumPageLink ? $albumPageLink.querySelector('a').getAttribute('href') : null;
        }, album);
        if(!albumPageLink) return { error: `Can't find albumPageLink` };

        console.log(`✨ YOUTOBE PARSER | albums page link received... ${albumPageLink}`);

        return {
            source: 'https://music.youtube.com',
            link: `https://music.youtube.com/${albumPageLink}`
        };
    } catch(e) {
        return { error: e };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album) {
    console.log('✨ YOUTOBE PARSER:START...');

    const response = await parsePage(browser, group, album);

    console.log('✨ YOUTOBE PARSER:END', response);
    return response;
}

module.exports = start;