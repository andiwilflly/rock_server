const Fuse = require('fuse.js');
const fetch = require("node-fetch");


const data = [
    'бакс',
    'доллар',
    'гривна',
    'рубль',
    'евро'
];

const fuse = new Fuse(data, { threshold: 0.3 });

const currencyExchange = async function(ctx, witAns) {
    let rates = await fetch('http://api.currencylayer.com/live?access_key=9ab4413f09489f1d3b436a6f706c1cff');
    rates = await rates.json();

    const currencyEntity = witAns.entities['currency:currency'] ? witAns.entities['currency:currency'][0] : null;

    ctx.reply(JSON.stringify(currencyEntity, null, 3));

    if(!currencyEntity.length) return ctx.reply('case 1');
    if(currencyEntity.length !== 2) return ctx.reply('case 2');

    const from = currencyEntity[0].value;
    const to = currencyEntity[1].value;

    ctx.reply(JSON.stringify({ from, to }, null, 3));

    // const { source, target, rate, ...rest } = await exchange.convert({ source: 'UAN', target: 'USD' });
    //
    // const value = await converter(67, { from: 'EUR', to: 'RUB' });
    console.log(rates)

    //return ctx.reply(`CURRENCY`);

}

//currencyExchange({}, {}, '200 баксов', 'доллары');

module.exports = currencyExchange;
