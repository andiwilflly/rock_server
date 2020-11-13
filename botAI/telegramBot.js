// Name: Валера
// ID: valera_ne_bot
// Token: 1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw

const { Telegraf } = require('telegraf');
const bot = new Telegraf('1412547933:AAEMpG4QT-BRrnnd8g7R2cS7Gw-QYdvoTmw') //сюда помещается токен, который дал botFather


async function start(AI) {
    bot.start(async (ctx) => {
        let ans = await AI.BOT.getResult("Привет!", AI.userData);
        ctx.reply(ans.response);
    });

    bot.on('message', async (ctx) => {

        console.log(ctx.message, 42);
        let ans = await AI.BOT.getResult(ctx.message.text, AI.userData);

        switch (true) {

            case ans.confidence >= 0.5: return ctx.reply(ans.response);

        }
        ctx.reply(ans.confidence < 0.5 ? "Прости, я потерял нить нашего разговора... Не могу бы ты уточнить?" : ans.response);
    })


    bot.hears('*', (ctx) => {
        ctx.reply('Hey there!!!!');
    });

    await bot.launch();

    console.log(`🤖 BOT AI | Telegram BOT ready...`);
}

module.exports = start;