async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();
        await page.goto(`https://beta.music.apple.com/us/search?term=${encodeURIComponent(group)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(3000);
        console.log(`✨ APPLE PARSER | page loaded...`);

        const albumPageLink = await page.evaluate((_album)=> {
            const $albumPageLink = [...document.querySelectorAll('[aria-label="Albums"] .shelf-grid__list-item .lockup__name')]
                .find($name => $name.innerText.includes('Like a House On Fire'));

            return $albumPageLink ? $albumPageLink.getAttribute('href') : null;
        }, album);

        if(!albumPageLink) return { error: `Can't find album: ${album}` };

        console.log(`✨ APPLE PARSER | albums page link received... ${albumPageLink}`);

        return {
           link: `${albumPageLink}`.replace('beta.', '')
        };
    } catch(e) {
        return { error: e };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album) {
    console.log('✨ APPLE PARSER:START...');

    const response = await parsePage(browser, group, album);

    console.log('✨ APPLE PARSER:END', response);
    return response;
}

module.exports = start;