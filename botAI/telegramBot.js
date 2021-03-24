const { Wit } = require('node-wit');
const WIKI = require('wikijs').default;
const { Telegraf } = require('telegraf');
const bot = new Telegraf('1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw') //сюда помещается токен, который дал botFather

const witAI = new Wit({  accessToken: "SKFYG45FKJ2RSVJIXDITMVLOKBSRSLQZ" });

const witAIProcessQuestion = require('./telegramBot/witAIProcessQuestion.telegram');
const witAIProcessWeather = require('./telegramBot/witAIProcessWeather.telegram');
const witAIProcessExchange = require('./telegramBot/witAIProcessExchange.telegram');
const witAIProcessWikipedia = require('./telegramBot/witAIProcessWikipedia.telegram');
const neuralAIProcessSpeak = require('./telegramBot/neuralAIProcessSpeak.telegram');

global.STATE = {};

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

        const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });

        // await ctx.reply(JSON.stringify(witAns, null, 3));
        // await ctx.reply(JSON.stringify(ans, null, 3));
        // await ctx.reply(JSON.stringify(global.STATE, null, 3));

        const searchEntity = witAns.entities['wit$wikipedia_search_query:wikipedia_search_query'];
        const locationEntity = witAns.entities['wit$location:location'];
        const isSearch = witAns.intents[0] && witAns.intents[0].name === 'search';
        const isExchange = witAns.intents[0] && witAns.intents[0].name === "currency_exchange";
        const isWeather = witAns.intents[0] && witAns.intents[0].name === "weather";

        try {
            switch (true) {
                // Clear STATE when user [decline] confirmation message about previous context
                // case global.STATE.confirmtion === true &&
                //      ans.response === '[decline]':
                //     return global.STATE = {};

                // Continue [weather] after user [confirm] prev context
                // case global.STATE.confirmtion === true &&
                //      global.STATE.subject === 'weather' &&
                //      ans.response === '[confirm]':
                //     global.STATE.confirmtion = false;
                //     return ctx.reply('Прогноз погоды в каком городе инетесует?');

                // Restore context for weather w.o. [location] provided
                // case global.STATE.isFinished === false && global.STATE.subject === 'weather' && !!locationEntity:
                //     await ctx.reply(`RESTORE weather context: '${global.STATE.text} ${locationEntity[0].body}'`);
                //     return await witAIProcessWeather(ctx, await witAI.message(`${global.STATE.text} ${locationEntity[0].body}`), wikiAPI);

                // case global.STATE.isFinished === false &&
                //      global.STATE.subject === 'weather' &&
                //      !isWeather:
                //     global.STATE.confirmtion = true;
                //     return ctx.reply('Прогноз погоды больше не нужен?');

                // Final check for STATE to prevent requests spam
                // case global.STATE.isFinished === false:
                //     return ctx.replyWithHTML(`<b>не все сразу! Дай расчелиться Комраду</b>`);

                // Speaking
                case ans.confidence >= 0.50:
                    return await neuralAIProcessSpeak(ctx, ans);

                // Wikipedia search
                case isSearch:
                case !witAns.intents && !searchEntity && !!locationEntity: // Search location (Wikipedia)
                    return await witAIProcessWikipedia(bot, ctx, witAns, wikiAPI);

               // Currency exchange
                case isExchange:
                    return await witAIProcessExchange(ctx, witAns);

                // Weather
                case isWeather:
                    return await witAIProcessWeather(ctx, witAns, wikiAPI);

                // TODO: ?
                // case witAns.intents[0] && witAns.intents[0].name === "questions" && witAns.intents[0].confidence > 0.5:
                //     return await witAIProcessQuestion(witAns);

                default: await ctx.reply('Not found' + ans.response);
            }
        } catch(e) {
           await ctx.reply(e);
            global.STATE = {};
        }
    })


    bot.catch((err, ctx) => {
        console.log(`BOT ERROR | ${ctx.updateType}`, err)
    })

    await bot.launch();

    console.log(`🤖 BOT AI | Telegram BOT ready...`);
}


module.exports = start;