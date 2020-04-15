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

        return { link: `https://play.google.com${albumLink}` };
    } catch(e) {
        return { error: e };
    }
}


// https://stackoverflow.com/questions/52225461/puppeteer-unable-to-run-on-heroku
async function start(group, album) {
    console.log('✨ GOOGLE PARSER:START...');

    browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const response = await parsePage(browser, group, album);
    browser.close();

    console.log('✨ GOOGLE PARSER:END', response);
    return response;
}

module.exports = start;