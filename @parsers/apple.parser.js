async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://beta.music.apple.com/us/search?term=${encodeURIComponent(group)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ APPLE PARSER | page loaded...`);

        let albumPageLink = await page.evaluate((_album)=> {
            const $albumPageLink = [...document.querySelectorAll('[aria-label="Albums"] .shelf-grid__list-item .lockup__name')]
                .find($name => $name.innerText.toLowerCase().includes(_album));

            return $albumPageLink ? $albumPageLink.getAttribute('href') : null;
        }, album);

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
                    const $albumPageLink = [...document.querySelectorAll('.l-row a')].find(x => x.innerText.toLowerCase().includes(_album))
                    return $albumPageLink ? $albumPageLink.getAttribute('href') : null
                }, album);
            }
        }

        if(!albumPageLink) return { source: 'https://music.apple.com', error: `Can't find album: ${album}` };

        console.log(`✨ APPLE PARSER | albums page link received... ${albumPageLink}`);

        return {
            source: 'https://music.apple.com',
            link: `${albumPageLink}`.replace('beta.', '')
        };
    } catch(e) {
        return { source: 'https://music.apple.com', error: e.toString() };
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