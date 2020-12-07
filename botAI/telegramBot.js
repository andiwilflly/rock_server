const { Wit } = require('node-wit');
const { Telegraf } = require('telegraf');
const bot = new Telegraf('1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw') //сюда помещается токен, который дал botFather

const witAI = new Wit({  accessToken: "SKFYG45FKJ2RSVJIXDITMVLOKBSRSLQZ" });

const witAIProcessQuestion = require('./telegramBot/witAIProcessQuestion.telegram');
const witAIProcessWeather = require('./telegramBot/witAIProcessWeather.telegram');
const witAIProcessExchange = require('./telegramBot/witAIProcessExchange.telegram');
const neuralAIProcessSpeak = require('./telegramBot/neuralAIProcessSpeak.telegram');


// @SOURCE: https://telegraf.js.org
// @SOURCE: https://cloud.google.com/natural-language/docs
// TODO: https://telegraf.js.org/#/?id=example
// TODO: https://github.com/dmtrbrl/BooksAndBot
// TODO: https://github.com/RealSpeaker/telegraf-session-local
async function start(AI) {
    console.log(`🤖 BOT AI | Started telegram bot...`);

    bot.on('message', async (ctx) => {
        const witAns = await witAI.message(ctx.message.text);

        if(ctx.message.chat.type === 'group' && !ctx.message.text.startsWith('Комрад')) return;
        if(ctx.message.chat.type === 'group' && !ctx.message.text.startsWith('комрад')) return;

        let ans = await AI.BOT.getResult(ctx.message.text, AI.userData);

        await ctx.reply(JSON.stringify(witAns, null, 3))

        switch (true) {
            case ans.confidence >= 0.60:
                return await neuralAIProcessSpeak(ctx, ans);
            case !witAns.intents[0]:
                return null;
            case witAns.intents[0].name === "currency_exchange" && witAns.intents[0].confidence > 0.5:
                return await witAIProcessExchange(ctx, witAns);
            case witAns.intents[0].name === "weather" && witAns.intents[0].confidence > 0.5:
                return await witAIProcessWeather(ctx, witAns);
            case witAns.intents[0].name === "questions" && witAns.intents[0].confidence > 0.5:
                return await witAIProcessQuestion(witAns);
        }
    })


    bot.catch((err, ctx) => {
        console.log(`BOT ERROR | ${ctx.updateType}`, err)
    })

    await bot.launch();

    console.log(`🤖 BOT AI | Telegram BOT ready...`);
}


module.exports = start;