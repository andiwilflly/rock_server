const fs = require('fs');
const puppeteer = require('puppeteer-extra');


const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));


let browser = null;


async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();
        await page.goto(`https://music.yandex.ua`, {
            waitUntil: 'networkidle2'
        });

        await page.waitFor(3000);

        await page.evaluate((_group)=> {
            const email = document.querySelector('input.deco-input_suggest');
            email.value = _group;
        }, group);
        await page.click('button.suggest-button');
        await page.waitFor(3000);

        const artistLink = await page.evaluate((_group)=> {
            const $artistLink = [ ...document.querySelectorAll('.serp-snippet__artists > .artist .artist__name a') ]
                .find($artist => $artist.innerText === 'Asking Alexandria');

            return $artistLink ? $artistLink.getAttribute('href') : null;
        }, group);

        if(!artistLink) return { error: `No such group: ${group}` };

        console.log('---->', `https://music.yandex.ua${artistLink}`);

        await page.goto(`https://music.yandex.ua${artistLink}/albums`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(3000);


        const albumLink = await page.evaluate((_album)=> {
            const $album = [...document.querySelector('.page-artist__albums').querySelectorAll('.album')]
                .find($artist => $artist.querySelector('.album__title.typo-main').innerText === 'Down To Hell');

            return $album ? $album.querySelector('a').getAttribute('href') : null;
        }, album)

        if(!albumLink) return { error: `No such album: ${album}` };

        console.log('✨YANDEX ENTER page', `https://music.yandex.ua${albumLink}`);
        return { link: `https://music.yandex.ua${albumLink}` };

    } catch(e) {
        return { error: e };
    }
}


async function start(group, album) {
    console.log('YANDEX PARSER:START!');

    //  const browser = await puppeteer.launch({
    //         args: [`--proxy-server=${newProxyUrl}`],
    //     });
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const response = await parsePage(browser, group, album);
    browser.close();

    console.log('YANDEX PARSER:END', response);
    return response;
}

module.exports = start;