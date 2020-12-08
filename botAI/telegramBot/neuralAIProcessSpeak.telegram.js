const animals = require('random-animals-api');
const getRandomJoke = require('./functions/joke.functions');
const randomInt = require('./functions/randomInt.function');
const witAIProcessGameOfThrones = require('./witAIProcessGameOfThrones.telegram');


module.exports = async function neuralAIProcessSpeak(ctx, ans) {
    global.STATE = {};

    await ctx.reply(JSON.stringify(ans, null, 3));
    try {
        switch (true) {
            case ans.response === '[gameOfThrones]': return await witAIProcessGameOfThrones(ctx);
            case ans.response === '[animal]': return ctx.replyWithPhoto(await animals[_getRandomAnimal()]());
            case ans.response === '[cat]':    return ctx.replyWithPhoto(await animals.cat());
            case ans.response === '[dog]':    return ctx.replyWithPhoto(await animals.dog());
            case ans.response === '[fox]':    return ctx.replyWithPhoto(await animals.fox());
            case ans.response === '[duck]':   return ctx.replyWithPhoto(await animals.duck());
            case ans.response === '[owl]':    return ctx.replyWithPhoto(await animals.owl());
            case ans.response === '[lizard]': return ctx.replyWithPhoto(await animals.lizard());

            case ans.response === '[joke]':   return ctx.reply(await getRandomJoke());
            default: return ctx.reply(ans.response);
        }
    } catch(e) {
        console.log(e);
        await ctx.reply("Ошибка");
    }
}

function _getRandomAnimal() {
    const data = ['cat', 'fox', 'dog', 'lizard', 'tiger', 'shiba', 'lion', 'duck', 'redPanda'];
    return data[randomInt(0, data.length-1)];
}