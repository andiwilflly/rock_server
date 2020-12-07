

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
        await ctx.replyWithHTML(`${icon} ${summary}`);
        if(witAns.entities['wit$location:location']) {
            const { lat, lon, } = await page.coordinates();
            await ctx.replyWithHTML(`https://www.google.com.ua/maps/@${lat},${lon},11z`);
        }
    } catch(e) {
        console.log(e);
        ctx.reply(`📖 ${summary}`);
    }
}


async function test() {
    const WIKI = require('wikijs').default;
    const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });

    const page = await wikiAPI.find('Новосибирск');

    console.log(await page.summary());
    console.log('======');
    console.log(await page.coordinates());
}

test();