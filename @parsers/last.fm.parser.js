async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();
        // https://music.apple.com/us/search?searchIn=am&term=Asking%20alexandria%20-%20down%20to%20hell
        await page.goto(`https://www.last.fm/music/${`${group.replace(/ /g, '+')}/${album.replace(/ /g, '+')}`}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        console.log(`✨ LAST.FM PARSER | page loaded...`);

        let isFound = await page.evaluate(()=> document.querySelector('.header-new-title').innerText);
        isFound = isFound.toLowerCase().includes(album);

        if(!isFound) {
            return {
                source: 'lastfm',
                error: `No such album in last fm: ${group} - ${album}`
            }
        }

        return {
            source: 'lastfm',
            link: `https://www.last.fm/music/${group.replace(/ /g, '+')}/${album.replace(/ /g, '+')}`
        };
    } catch(e) {
        return { source: 'lastfm', error: e.toString() };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album) {
    console.log('✨ LAST.FM PARSER:START...');

    const response = await parsePage(browser, group, album);

    console.log('✨ LAST.FM PARSER:END', response);
    return response;
}

module.exports = start;