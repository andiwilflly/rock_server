const Fuse = require('fuse.js');
const fetch = require("node-fetch");


// https://exchangerate.host/#/#docs
const currencyExchange = async function(ctx, witAns) {
    const currencyEntities = witAns.entities['currency:currency'];

    ctx.reply(JSON.stringify(currencyEntities, null, 3));

    if(!currencyEntities.length) return ctx.reply('case 1');
    if(currencyEntities.length !== 2) return ctx.reply('case 2');

    let from = currencyEntities[0].body;
    let to = currencyEntities[1].body;
    const amount = from.match(/\d+/) ? +from.match(/\d+/)[0] : 1;

    from = fuse.search(from.replace(/\d+/, ''))[0];
    to = fuse.search(to)[0];
    from = from ? from.item : null;
    to = to ? to.item : null;
    from = match[from];
    to = match[to];

    let rates = await fetch(`https://api.exchangerate.host/latest?base=${from}`);
    rates = (await rates.json()).rates;

    const result = rates[to] * amount;

    if(isNaN(result)) return ctx.reply(JSON.stringify({
        from,
        to,
        rate: rates[to],
        result: rates[to] * amount,
        amount
    }, null, 3));

    ctx.reply(`
        💰 ${formatter.format(amount)} ${icons[from]} -> ${formatter.format(+result.toFixed(2))} ${icons[to]} 
    `);
}


const data = [
    'USD',
    'UAH',
    'RUB',
    'EUR',
    'бакс',
    'доллар',
    'гривна',
    'рубль',
    'dollar',
    'евро'
];
const match = {
    'USD': "USD",
    'UAH': "UAH",
    'RUB': "RUB",
    'EUR': "EUR",
    'бакс': "USD",
    'доллар': "USD",
    'dollar': "USD",
    'гривна': "UAH",
    'рубль': "RUB",
    'евро': "EUR"
};
const icons = {
    "EUR": '€',
    "USD": '$',
    "RUB": '₽',
    "UAH": '₴'
}

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const fuse = new Fuse(data, { threshold: 0.3 });

currencyExchange({ reply: console.log }, { entities: {
    'currency:currency': [
        {
            "id": "1089102248228413",
            "name": "currency",
            "role": "currency",
            "start": 11,
            "end": 14,
            "body": "456677USD",
            "confidence": 1,
            "entities": [],
            "value": "usd",
            "type": "value"
        },
        {
            "id": "1089102248228413",
            "name": "currency",
            "role": "currency",
            "start": 15,
            "end": 18,
            "body": "UAH",
            "confidence": 1,
            "entities": [],
            "value": "uah",
            "type": "value"
        }
    ]
} });



module.exports = currencyExchange;
