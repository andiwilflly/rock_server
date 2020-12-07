const fetch = require("node-fetch");

// @SOURCE: https://mymemory.translated.net/doc/spec.php
// https://api.mymemory.translated.net/get?q=Hello%20World!&langpair=en|ru&de=andiwillfly@gmail.com
async function witAIProcessGameOfThrones(ctx) {

    let result = await fetch('https://game-of-thrones-quotes.herokuapp.com/v1/random');
    result = await result.json();

    let quote = result.sentence;

    quote = await fetch(`https://api.mymemory.translated.net/get?q=${quote}&langpair=en|ru&de=andiwillfly@gmail.com`);
    quote = await quote.json();

    console.log(quote.matches[0].translation, result.character.name);

    ctx.replyWithHTML(`
        <i>"${quote.matches[0].translation}"</i>
      
                    <b>${result.character.name}</b>
    `);
}

module.exports = witAIProcessGameOfThrones;

witAIProcessGameOfThrones();