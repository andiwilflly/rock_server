

module.exports = async function witProcessWikipedia(bot, ctx, witAns, wikiAPI) {
    const searchEntity = witAns.entities['wit$wikipedia_search_query:wikipedia_search_query'] ?
        witAns.entities['wit$wikipedia_search_query:wikipedia_search_query'][0]
        :
        witAns.entities['wit$location:location'] ?
            witAns.entities['wit$location:location'][0]
            :
            null;

    if(!searchEntity) return ctx.reply('Wikipedia ???');

    const icon = witAns.entities['wit$location:location'] ? '🏠' : '📖';
    let summary = 'Not found [summary]';

    try {
        const page = await wikiAPI.find(searchEntity.body);
        summary = await page.summary();

        let img = '';
        if(!summary) {
            summary = 'Найдено несколько результатов: \n' + (await wikiAPI.search('Медведев', 3)).results.join('\n');
        } else {
            img = await page.mainImage();
        }

        if(summary.length > 300) {
            console.log('=> 1', summary);
            summary = summary.slice(0, 300).split('.');
            summary = summary.length > 1 ? summary.filter((a,i)=> i+1 !== summary.length).join('.') : summary.join();
            console.log('=> 2', summary);
        }
        const { lat, lon } = await page.coordinates();
        await ctx.replyWithHTML(`
            ${icon} ${summary} ${lat ? `https://www.google.com.ua/maps/@${lat},${lon},11z`: img }
        `);
    } catch(e) {
        console.log(e);
        ctx.reply(`📖 ${summary}`);
    }
}


async function test() {
    const WIKI = require('wikijs').default;
    const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });

    const page = await wikiAPI.search('Медведев', 3);

    console.log('======');
    console.log(page);
}

test();