async function findInSongs(page, group, album) {

    const isFound = await page.evaluate((_group, _album)=> {
        const $item = [...document.querySelectorAll('div.ytmusic-play-button-renderer')].map($el => {
            return $el.closest('.ytmusic-shelf-renderer')
        }).find($el => {
            const title = $el.querySelector('.title').innerText.toLowerCase();
            return title.includes(_group) && title.includes(_album);
        });
        if(!$item) return null;

        $item.querySelector('div.ytmusic-play-button-renderer').click();
        return true;
    }, group, album);

    if(!isFound) return null;
    await new Promise(r => setTimeout(r, 2500));
    return page.url();
}


async function parsePage(browser, group, album) {
    const page = await browser.newPage();
    try {
        page.setDefaultNavigationTimeout(50000);

        const q = `${encodeURIComponent(group.split(' ').join('+'))}+-+${encodeURIComponent(album.split(' ').join('+'))}`;

        await page.goto(`https://music.youtube.com/search?q=${q}`, {
            waitUntil: 'networkidle0'
        });
        await new Promise(r => setTimeout(r, 1000));
        console.log(`✨ YOUTUBE PARSER | page loaded...`, `https://music.youtube.com/search?q=${q}`);

        try {
            await page.click('button[aria-label="Accept all"]');
            await page.waitForNavigation({waitUntil: 'networkidle0'});
        } catch {}

        await new Promise(r => setTimeout(r, 1000));

        let artistPageLink = await page.evaluate((_group, _album)=> {
            const $artistPageLink = [...document.querySelectorAll('.yt-simple-endpoint.style-scope.ytmusic-responsive-list-item-renderer')]
                .find($link =>
                    $link.getAttribute('aria-label').toLowerCase().includes(_album)
                    && $link.getAttribute('href') && !$link.getAttribute('href').includes('watch?')
                    && $link.parentNode.querySelector('.yt-simple-endpoint.yt-formatted-string')
                    && $link.parentNode.querySelector('.yt-simple-endpoint.yt-formatted-string').innerHTML.toLowerCase() == _group
                );

            return $artistPageLink ? $artistPageLink.getAttribute('href') : null;
        }, group, album);

        console.log(artistPageLink, 1);

        if (!artistPageLink) artistPageLink = await page.evaluate((_album)=> {
            const $link = [
                ...document.querySelectorAll('.yt-simple-endpoint.style-scope.ytmusic-responsive-list-item-renderer'),
                ...document.querySelectorAll('.yt-simple-endpoint.yt-formatted-string'),
            ]
                .find($el =>
                    ($el.innerText.toLowerCase().includes(_album) || ($el.getAttribute('aria-label') && $el.getAttribute('aria-label').toLowerCase().includes(_album)))
                    && $el.getAttribute('href') && !$el.getAttribute('href').includes('watch?'));
            if(!$link) return null;
            return $link.getAttribute('href');
        }, album);

        console.log(artistPageLink, 2);

        if(!artistPageLink) artistPageLink = await findInSongs(page, group, album);

        console.log(artistPageLink, 4);

        if(!artistPageLink) return { source: 'youtube', error: `Can't find (https://music.youtube.com/search?q=${q})` };

        return {
            source: 'youtube',
            link: artistPageLink.includes('https') ? artistPageLink : `https://music.youtube.com/${artistPageLink}`
        };
    } catch(e) {
        return { source: 'youtube', error: e.toString() };
    } finally {
        await page.close();
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(browser, group, album) {
    console.log('✨ YOUTUBE PARSER:START...');
    const response = await parsePage(browser, group, album);
    console.log('✨ YOUTUBE PARSER:END', response);
    return response;
}

module.exports = start;
