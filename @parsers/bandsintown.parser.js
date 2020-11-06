
async function parseConcerts(browser, concertsUrls = []) {

    const promises = concertsUrls.map(url => {
        return new Promise(async resolve => {
            const page = await browser.newPage();
            await page.goto(url, {
                waitUntil: 'networkidle2'
            });

            const concertDetails = await page.evaluate(()=> {
                return {
                    date:  document.querySelector('._1pJ33vJuFJKauIgYOkCleu').innerText,
                    place: document.querySelector('._1fBpJ_FMo49Ky4JD3xE6wq').innerText,
                    logo:  document.querySelector('._3FxoLllHIYDsTLMcW1mAl8 img').getAttribute('src'),
                    lat:   document.querySelector('#stay22-widget').getAttribute('src').match(/lat=[-\d.]*/)[0].replace('lat=', ''),
                    lng:   document.querySelector('#stay22-widget').getAttribute('src').match(/lng=[-\d.]*/)[0].replace('lng=', '')
                };
            });

            console.log(`✨ BANDSINTOWN PARSER | concert loaded...`, concertDetails.place);

            await page.close();

            resolve(concertDetails);
        });
    })

    console.log(`✨ BANDSINTOWN PARSER | concerts loaded...`, promises.length);

    return await Promise.all(promises);
}


async function parsePage(browser, artist) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://www.bandsintown.com`, {
            waitUntil: 'networkidle2'
        });

        console.log(`✨ BANDSINTOWN PARSER | login page loaded...`);

        await page.focus('._30CmZ8MOAaWycuClF-jU6d');
        await page.keyboard.type(artist);

        await page.waitFor(500);

        const firstResultUrl = await page.evaluate((_artist)=> {
            const firstResult = document.querySelector('._19JBZBd19dn8PF0B4MjSaX').children[0];
            return firstResult ? firstResult.getAttribute('href') : null
        }, artist);

        if(!firstResultUrl) return { error: `Artist not found: ${artist}` };

        console.log(`✨ BANDSINTOWN PARSER | firstResultUrl loaded...`, firstResultUrl);

        await page.goto(firstResultUrl);
        await page.waitFor(500);

        const concertsUrls = await page.evaluate(()=> {
            return [...document.querySelector('._2jeHbgNeqh7EbnCEJRiwHL').children].map($concert => $concert.getAttribute('href'))
        });

        if(!concertsUrls) return { error: `No upcoming concerts: ${artist} (${firstResultUrl})`}

        console.log(`✨ BANDSINTOWN PARSER | concertsUrls loaded...`, concertsUrls.length);

        return await parseConcerts(browser, concertsUrls.filter(Boolean));

    } catch(e) {
        return { error: e.toString() };
    }
}


async function start(browser, artist) {
    console.log('✨ BANDSINTOWN PARSER:START...');

    const response = await parsePage(browser, artist);

    console.log('✨ BANDSINTOWN PARSER:END', response);
    return response;
}

module.exports = start;