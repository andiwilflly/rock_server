async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();


        await page.goto(`https://play.google.com/store/search?q=${group.split(' ').join('+')}&c=music`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ SPOTIFY PARSER | page loaded...`);



        return {
            source: 'https://play.google.com',
            link: `https://play.google.com${albumLink}`
        };
    } catch(e) {
        return { source: 'https://play.google.com', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ SPOTIFY PARSER:START...');

    const response = await parsePage(browser, group, album);

    console.log('✨ SPOTIFY PARSER:END', response);
    return response;
}

module.exports = start;