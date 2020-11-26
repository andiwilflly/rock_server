// Name: Валера
// ID: valera_ne_bot
// Token: 1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw
const animals = require('random-animals-api');
const { Telegraf, Extra, Markup } = require('telegraf');
const bot = new Telegraf('1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw') //сюда помещается токен, который дал botFather

const getRandomJoke = require('./telegramBot/joke.telegram');
const weather = require('./telegramBot/weather.telegram');


const keyboard = Markup.inlineKeyboard([
    Markup.locationRequestButton('Send location')
])


// @SOURCE: https://telegraf.js.org
// @SOURCE: https://cloud.google.com/natural-language/docs
async function start(AI) {

    bot.on('message', async (ctx) => {
        if(ctx.message.chat.type === 'group' && !ctx.message.text.startsWith('Комрад')) return;
        if(ctx.message.chat.type === 'group' && !ctx.message.text.startsWith('комрад')) return;

        let ans = await AI.BOT.getResult(ctx.message.text, AI.userData);

        console.log('ctx.message | ', ctx.message);
        console.log('ans | ', ans);

        if(ans.confidence <= 0.6) return await ctx.reply("Я нифига не понял что ты написал");
        try {
            switch (true) {
                case ans.response === '[animal]': return ctx.replyWithPhoto(await animals[_getRandomAnimal()]());
                case ans.response === '[cat]':    return ctx.replyWithPhoto(await animals.cat());
                case ans.response === '[dog]':    return ctx.replyWithPhoto(await animals.dog());
                case ans.response === '[fox]':    return ctx.replyWithPhoto(await animals.fox());
                case ans.response === '[duck]':   return ctx.replyWithPhoto(await animals.duck());
                case ans.response === '[owl]':    return ctx.replyWithPhoto(await animals.owl());
                case ans.response === '[lizard]': return ctx.replyWithPhoto(await animals.lizard());

                case ans.response === '[weather]': return Extra.markup(keyboard);
                case ans.response === '[joke]':   return ctx.reply(await getRandomJoke());
            }
        } catch(e) {
            console.log(e);
            await ctx.reply("Ошибка");
        }

        return ctx.reply(ans.confidence < 0.5 ? "Прости, я потерял нить нашего разговора... Не могу бы ты уточнить?" : ans.response);
    })


    bot.catch((err, ctx) => {
        console.log(`BOT ERROR | ${ctx.updateType}`, err)
    })

    bot.use(async (ctx, next) => {
        const start = new Date()
        await next()
        const ms = new Date() - start
        console.log('Response time: %sms', ms)
    })

    await bot.launch();

    console.log(`🤖 BOT AI | Telegram BOT ready...`);
}

function _randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

function _getRandomAnimal() {
    const data = ['cat', 'fox', 'dog', 'lizard', 'owl', 'tiger', 'shiba', 'lion', 'duck', 'redPanda'];
    return data[_randomInteger(0, data.length-1)];
}


module.exports = start;