
async function parseConcerts(browser, concertsUrls = []) {

    const promises = concertsUrls.map(url => {
        return new Promise(async resolve => {
            const page = await browser.newPage();
            await page.goto(url, {
                waitUntil: 'networkidle0'
            });

            const concertDetails = await page.evaluate(()=> {

                const $widgetLat = document.querySelector('#stay22-widget') ?
                    document.querySelector('#stay22-widget').getAttribute('src').match(/lat=[-\d.]*/)
                    :
                    null;
                const $widgetLng = document.querySelector('#stay22-widget') ?
                    document.querySelector('#stay22-widget').getAttribute('src').match(/lng=[-\d.]*/)
                    :
                    null;
                const lat = $widgetLat ? $widgetLat[0].replace('lat=', '') : null;
                const lng = $widgetLng ? $widgetLng[0].replace('lng=', '') : null;
                return {
                    date:  document.querySelector('._1pJ33vJuFJKauIgYOkCleu').innerText,
                    place: document.querySelector('._1fBpJ_FMo49Ky4JD3xE6wq').innerText,
                    maps:  lat ? `https://www.google.com.ua/maps/place/Zenith/@${lat},${lng},17z/` : null,
                    lat,
                    lng
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
            waitUntil: 'networkidle0'
        });

        console.log(`✨ BANDSINTOWN PARSER | login page loaded...`);

        await page.focus('._30CmZ8MOAaWycuClF-jU6d');
        await page.keyboard.type(artist);

        await page.waitForTimeout(500);

        const firstResultUrl = await page.evaluate((_artist)=> {
            const firstResult = document.querySelector('._19JBZBd19dn8PF0B4MjSaX').children;
            return firstResult ? firstResult[0].getAttribute('href') : null
        }, artist);

        if(!firstResultUrl) return { error: `Artist not found: ${artist}` };

        console.log(`✨ BANDSINTOWN PARSER | firstResultUrl loaded...`, firstResultUrl);

        await page.goto(firstResultUrl);
        await page.waitForTimeout(500);

        const concertsUrls = await page.evaluate(()=> {
            const $el = document.querySelector('._2jeHbgNeqh7EbnCEJRiwHL');
            if(!$el) return; // No upcoming events
            return [...$el.children].filter(Boolean).map($concert => $concert.getAttribute('href'))
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
