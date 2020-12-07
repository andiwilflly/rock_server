

module.exports = async function witProcessWikipedia(bot, ctx, witAns, wikiAPI) {
    const searchEntity = witAns.entities['wit$wikipedia_search_query:wikipedia_search_query'] ? witAns.entities['wit$wikipedia_search_query:wikipedia_search_query'][0] : null;

    if(!searchEntity) return ctx.reply('Wikipedia ???');

    try {
        const page = await wikiAPI.page(searchEntity.body);

        await bot.telegram.sendMessage(
            ctx.message.chat.id,
            await page.summary(),
            { parse_mode: 'HTML' }
        );
        //ctx.reply(JSON.stringify(await page.summary(), null, 3));
    } catch(e) {
        ctx.reply(e);
    }
}