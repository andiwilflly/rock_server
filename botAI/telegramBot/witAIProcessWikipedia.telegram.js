

module.exports = async function witProcessWikipedia(bot, ctx, witAns, wikiAPI) {
    const searchEntity = witAns.entities['wit$wikipedia_search_query:wikipedia_search_query'] ? witAns.entities['wit$wikipedia_search_query:wikipedia_search_query'][0] : null;

    if(!searchEntity) return ctx.reply('Wikipedia ???');

    try {
        const page = await wikiAPI.find(searchEntity.body);
        const summary = await page.summary();

        await bot.telegram.sendMessage(
            ctx.message.chat.id,
            `📖 ${summary}`,
            { parse_mode: 'HTML' }
        );
        //ctx.reply(JSON.stringify(await page.summary(), null, 3));
    } catch(e) {
        ctx.reply(e);
    }
}


// async function test() {
//     const WIKI = require('wikijs').default;
//     const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
//
//     const page = await wikiAPI.find('секс');
//
//     console.log(page,await page.summary(), 42);
// }
//
// test();