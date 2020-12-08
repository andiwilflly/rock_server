const fetch = require("node-fetch");
const translate = require('@vitalets/google-translate-api');


async function witAIProcessGameOfThrones(ctx) {
    let result = await fetch('https://game-of-thrones-quotes.herokuapp.com/v1/random');
    result = await result.json();

    const quote = await translate(result.sentence, { to: 'ru' });
    const name = await translate(result.character.name, { to: 'ru' });

    ctx.replyWithHTML(`
        <i>"🐉 ${quote.text}"</i>

        <b>${name.text}</b>
    `);
}

module.exports = witAIProcessGameOfThrones;
