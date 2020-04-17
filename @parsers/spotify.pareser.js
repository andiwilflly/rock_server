const login =  'andiwillfly@gmail.com';
const pass =  '121314ward';

async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://accounts.spotify.com/en/login`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ SPOTIFY PARSER | LOGIN page loaded...`);


        await page.focus('#login-username')
        await page.keyboard.type(login);

        await page.focus('#login-password')
        await page.keyboard.type(pass);

        await page.waitFor(3000);
        // await page.click('#login_form_submit');
        await page.evaluate(()=> document.querySelector('#login-button').click());
        await page.waitFor(2000);


        await page.goto(`https://open.spotify.com/search/${group}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(1000);
        console.log(`✨ SPOTIFY PARSER | search page loaded...`);


        const groupLink = await page.evaluate((_group)=> {
            const $groupLink = [...document.querySelector('[aria-label="Artists"]').querySelectorAll('a')]
                .find($link => $link.innerText.toLowerCase().includes(group));
            return $groupLink ? $groupLink.getAttribute('href') : null;
        }, group);
        if(!groupLink) return { source: 'https://open.spotify.com', error: `Can't find group ${group}` };


        await page.goto(`https://open.spotify.com${groupLink}`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ SPOTIFY PARSER | GROUP '${group}' page loaded...`);

        return {
            source: 'https://play.google.com',
            link: `https://play.google.com${"groupLink"}`
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