const Fuse = require('fuse.js');

// TODO: обмен 0.5$ на грн
// TODO: 0.5 евро в гривне
// TODO: 34.6 EUR TO UAH

// https://exchangerate.host/#/#docs
const currencyExchange = async function(ctx, witAns) {
    global.STATE = {};

    const currencyEntities = witAns.entities['currency:currency'];

    // ctx.reply(JSON.stringify(currencyEntities, null, 3));

    if(!currencyEntities.length) return ctx.reply('case 1');
    if(currencyEntities.length !== 2) return ctx.reply('case 2');

    let allRates = await fetch(`https://api.exchangerate.host/latest`);
    allRates = (await allRates.json()).rates;

    const fuse = new Fuse([...data, ...Object.keys(allRates)], { threshold: 0.3 });
    const match = {
        ..._match,
        ...Object.keys(allRates).reduce((res, next)=> {
            res[next] = next;
            return res;
        }, {})
    };

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
        💰 ${formatter.format(amount)} ${icons[from]} ⇨ ${formatter.format(+result.toFixed(2))} ${icons[to]} 
    `);
}


const data = [
    'бакс',
    'доллар',
    'гривна',
    'грн',
    'руб',
    'рубль',
    'dollar',
    'евро'
];
const _match = {
    'бакс': "USD",
    'доллар': "USD",
    'dollar': "USD",
    'гривна': "UAH",
    'грн': "UAH",
    'рубль': "RUB",
    'руб': "RUB",
    'евро': "EUR"
};
const icons = {
    "EUR": '€',
    "USD": '$',
    "RUB": '₽',
    "UAH": '₴'
}

const formatter = new Intl.NumberFormat();

// currencyExchange({ reply: console.log }, { entities: {
//     'currency:currency': [
//         {
//             "id": "1089102248228413",
//             "name": "currency",
//             "role": "currency",
//             "start": 11,
//             "end": 14,
//             "body": "456677USD",
//             "confidence": 1,
//             "entities": [],
//             "value": "usd",
//             "type": "value"
//         },
//         {
//             "id": "1089102248228413",
//             "name": "currency",
//             "role": "currency",
//             "start": 15,
//             "end": 18,
//             "body": "UAH",
//             "confidence": 1,
//             "entities": [],
//             "value": "uah",
//             "type": "value"
//         }
//     ]
// } });



module.exports = currencyExchange;
