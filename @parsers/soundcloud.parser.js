// https://soundcloud.com/search/people?q=Wildways

async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();


        await page.goto(`https://soundcloud.com/search/people?q=${encodeURIComponent(group)}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ SOUNDCLOUD PARSER | page loaded...`);

        const groupLink = await page.evaluate((_group)=> {
            const $groupLink = [...document.querySelectorAll('.searchList__item a')]
                .find($link => $link.innerText.toLowerCase().includes(_group));
            return $groupLink ? $groupLink.getAttribute('href') : null
        }, group);
        if(!groupLink) return { source: 'https://soundcloud.com', error: `Can't find group ${group}` };


        await page.goto(`https://soundcloud.com${groupLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ GOOGLE PARSER | '${group}' page loaded...`);

        const albumLink = await page.evaluate((_album)=> {
            const $albumLink = [...document.querySelectorAll('.soundList__item a')]
                .find($link => $link.innerText.toLowerCase().includes(_album));
            return $albumLink ? $albumLink.getAttribute('href') : null;
        }, album);
        if(!albumLink) return { source: 'https://soundcloud.com', error: `Can't find album ${album}` };

        return {
            source: 'https://soundcloud.com',
            link: `https://soundcloud.com${albumLink}`
        };
    } catch(e) {
        return { source: 'https://soundcloud.com', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ SOUNDCLOUD PARSER:START...');

    const response = await parsePage(browser, group, album);

    console.log('✨ SOUNDCLOUD PARSER:END', response);
    return response;
}

module.exports = start;