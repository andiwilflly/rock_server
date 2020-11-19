// Name: Валера
// ID: valera_ne_bot
// Token: 1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw
const animals = require('random-animals-api');
const { Telegraf, Extra, Markup } = require('telegraf');
const bot = new Telegraf('1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw') //сюда помещается токен, который дал botFather

const getRandomJoke = require('./telegramBot/joke.telegram');


const keyboard = Markup.inlineKeyboard([
    Markup.urlButton('❤️', 'http://telegraf.js.org'),
    Markup.callbackButton('Delete', 'delete')
])


// @SOURCE: https://telegraf.js.org
async function start(AI) {
    bot.start(async (ctx) => {
        let ans = await AI.BOT.getResult("Привет!", AI.userData);
        ctx.reply(ans.response);
    });

    bot.on('message', async (ctx) => {
        if(ctx.message.chat.type === 'group' && !ctx.message.text.startsWith('Комрад')) return;
        if(ctx.message.chat.type === 'group' && !ctx.message.text.startsWith('комрад')) return;

        let ans = await AI.BOT.getResult(ctx.message.text, AI.userData);

        console.log('ctx.message | ', ctx.message);
        console.log('ans | ', ans);

        try {
            switch (true) {
                case ans.response === '[animal]': return ctx.replyWithPhoto(await animals[_getRandomAnimal()]());
                case ans.response === '[cat]':    return ctx.replyWithPhoto(await animals.cat());
                case ans.response === '[dog]':    return ctx.replyWithPhoto(await animals.dog());
                case ans.response === '[fox]':    return ctx.replyWithPhoto(await animals.fox());
                case ans.response === '[duck]':   return ctx.replyWithPhoto(await animals.duck());
                case ans.response === '[owl]':    return ctx.replyWithPhoto(await animals.owl());
                case ans.response === '[lizard]': return ctx.replyWithPhoto(await animals.lizard());

                case ans.response === '[joke]':   return ctx.reply(await getRandomJoke());
                case ans.confidence >= 0.5:       return ctx.reply(ans.response);
            }
        } catch(e) {
            console.log(e);
            await ctx.telegram.sendCopy(ctx.chat.id, ctx.message, Extra.markup(keyboard));
        }

        return ctx.reply(ans.confidence < 0.5 ? "Прости, я потерял нить нашего разговора... Не могу бы ты уточнить?" : ans.response);
    })


    bot.catch((err, ctx) => {
        console.log(`BOT ERROR | ${ctx.updateType}`, err)
    })

    await bot.launch();

    console.log(`🤖 BOT AI | Telegram BOT ready...`);
}

function _randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

function _getRandomAnimal() {
    const data = ['cat', 'fox', 'bird', 'dog', 'bunny', 'lizard', 'owl', 'tiger', 'shiba', 'lion', 'duck', 'panda', 'redPanda', 'penguin'];
    return data[_randomInteger(0, data.length-1)];
}


module.exports = start;