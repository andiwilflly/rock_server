// Name: Валера
// ID: valera_ne_bot
// Token: 1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw
const { Wit } = require('node-wit');
const animals = require('random-animals-api');
const { Telegraf, Extra, Markup } = require('telegraf');
const bot = new Telegraf('1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw') //сюда помещается токен, который дал botFather

const witAI = new Wit({
    accessToken: "SKFYG45FKJ2RSVJIXDITMVLOKBSRSLQZ",
    // logger: new log.Logger(log.DEBUG) // optional
});

const getRandomJoke = require('./telegramBot/joke.telegram');
const witAIProcessQuestion = require('./telegramBot/witAIProcessQuestion.telegram');
const witAIProcessWeather = require('./telegramBot/witAIProcessWeather.telegram');


const keyboard = Markup.inlineKeyboard([
    Markup.locationRequestButton('Send location')
])


// @SOURCE: https://telegraf.js.org
// @SOURCE: https://cloud.google.com/natural-language/docs
// TODO: https://telegraf.js.org/#/?id=example
// TODO: https://github.com/dmtrbrl/BooksAndBot
// TODO: https://github.com/RealSpeaker/telegraf-session-local
async function start(AI) {

    bot.on('message', async (ctx) => {
        const witAns = await witAI.message(ctx.message.text);

        if(ctx.message.chat.type === 'group' && !ctx.message.text.startsWith('Комрад')) return;
        if(ctx.message.chat.type === 'group' && !ctx.message.text.startsWith('комрад')) return;

        let ans = await AI.BOT.getResult(ctx.message.text, AI.userData);

        // console.log('ctx.message | ', ctx.message);
        // console.log('ans | ', ans);

        if(ans.confidence >= 0.60) {
            await ctx.reply(JSON.stringify(ans, null, 3));
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
                }
            } catch(e) {
                console.log(e);
                await ctx.reply("Ошибка");
            }
        } else {
            await ctx.reply(JSON.stringify(witAns, null, 3))
            // Wit AI
            switch (true) {
                case !witAns.intents[0]:
                    return null;
                case witAns.intents[0].name === "weather" && witAns.intents[0].confidence > 0.5:
                    return await witAIProcessWeather(ctx, witAns);
                case witAns.intents[0].name === "questions" && witAns.intents[0].confidence > 0.5:
                    return await witAIProcessQuestion(witAns);
            }
        }
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
    const data = ['cat', 'fox', 'dog', 'lizard', 'tiger', 'shiba', 'lion', 'duck', 'redPanda'];
    return data[_randomInteger(0, data.length-1)];
}


module.exports = start;