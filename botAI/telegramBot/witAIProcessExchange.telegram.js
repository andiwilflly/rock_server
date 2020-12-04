const Fuse = require('fuse.js');
const fetch = require("node-fetch");


// https://exchangerate.host/#/#docs
const currencyExchange = async function(ctx, witAns) {
    const currencyEntities = witAns.entities['currency:currency'];

    ctx.reply(JSON.stringify(currencyEntities, null, 3));

    if(!currencyEntities.length) return ctx.reply('case 1');
    if(currencyEntities.length !== 2) return ctx.reply('case 2');

    let from = currencyEntities[0].value;
    let to = currencyEntities[1].value;
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

    if(isNaN(result)) return  ctx.reply(JSON.stringify({
        from,
        to,
        rate: rates[to],
        result: rates[to] * amount,
        amount
    }, null, 3));

    ctx.reply(`
        💰 ${amount} ${icons[from]} -> ${result.toFixed(2)} ${icons[to]} 
    `);
}


const data = [
    'бакс',
    'доллар',
    'гривна',
    'рубль',
    'евро'
];
const match = {
    'бакс': "USD",
    'доллар': "USD",
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
const fuse = new Fuse(data, { threshold: 0.3 });

currencyExchange({ reply: console.log }, { entities: {
    'currency:currency': [
        {
            "id": "1089102248228413",
            "name": "currency",
            "role": "currency",
            "start": 0,
            "end": 10,
            "body": "200 гривен",
            "confidence": 0.9893,
            "entities": [],
            "value": "200 гривен",
            "type": "value"
        },
        {
            "id": "1089102248228413",
            "name": "currency",
            "role": "currency",
            "start": 13,
            "end": 17,
            "body": "евро",
            "confidence": 0.9695,
            "entities": [],
            "value": "евро",
            "type": "value"
        }
    ]
} });



module.exports = currencyExchange;
