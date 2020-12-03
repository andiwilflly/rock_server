const fs = require('fs');
const WIKI = require('wikijs').default;
const weather = require('openweather-apis');
const randomAnswer = require('./functions/randomAnswer.function');


const KEY = 'e0ec6da3ca0381df4cc5564f7053ca85';

weather.setLang('ru');
weather.setAPPID(KEY);

module.exports = async function(ctx, witAns) {
    const locationEntity = witAns.entities['wit$location:location'] ? witAns.entities['wit$location:location'][0] : null;
    const dateEntity = witAns.entities['date_time:date_time'] ? witAns.entities['date_time:date_time'][0] : null;

    if(!locationEntity) return ctx.reply(randomAnswer([
        'Какой город?',
        'В каком городе ты живешь?',
        'Нужно указать город',
        'Обязательно нужно писать город и можно также задать день недели (например погода в четверг)',
        'Прогноз погоды в каком городе тебя интересует?'
    ]));

    const result = await getAllWeather(locationEntity.value, dateEntity);

    if(result.shortday) return ctx.reply(`
        🏠 Прогноз погоды в ${result.city} 
        ${result.date} (${result.dateType})
        🌡 От ${result.low}℃ до ${result.high}℃
        🌧 Вероятность осадков ${result.precip}%
    `);

    if(!result.main) return ctx.reply(JSON.stringify(result, null, 3));

    return ctx.reply(`
        🏠 ${result.name} (${ result.weather.map(d => d.description).join(', ') })
        🌡 ${Math.round(result.main.temp)}℃ (ощущается как ${Math.round(result.main.feels_like)}℃)
        💧 ${result.main.humidity }%
        ${result.clouds.all > 50 ? '🌥 облачно' : '🌤 безоблачно' }
        🌪 ${Math.round((result.wind.speed * 60 * 60) / 1000)} км в час
    `);
}


async function getAllWeather(origCity, dateEntity = {}) {

    weather.setCity(origCity);
    return new Promise(async resolve => {
        await weather.getAllWeather(async function(err, res) {
            // if(res.cod === '404') {
               try {
                   const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
                   const page = await wikiAPI.search(origCity, 2);

                   const city = page.results.sort((a,b)=> a.length - b.length)[0];

                   if(dateEntity) {
                       getDateForecastWeather(city, dateEntity, resolve);
                   } else {
                       weather.setCity(city);
                       weather.getAllWeather(function(err, res) {
                           resolve({ ...res, city });
                       });
                   }
               } catch(e) {
                   resolve('error: ' + e);
               }
            // } else {
            //     resolve(res);
            // }
        });
    })
}

async function getDateForecastWeather(city, dateEntity, resolve) {
    const Fuse = require('fuse.js');
    const weather = require('weather-js');

    const data = [
        'понедельник',
        'вторник',
        'среда',
        'четверг',
        'пятница',
        'суббота',
        'воскресенье',
        'сегодня',
        'завтра',
        'zavtra',
        'poslezavtra',
        'послезавтра',
    ];

    const weekDaysRus = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const fuse = new Fuse(data, { threshold: 0.3 });

    const dateType = fuse.search(dateEntity.value)[0] ? fuse.search(dateEntity.value)[0].item : '';

    let weekDay = '';
    switch (true) {
        case dateType === 'сегодня':
            weekDay = weekDays[(new Date()).getDay()];
            break;
        case dateType === 'zavtra':
        case dateType === 'завтра':
            weekDay = weekDays[(new Date()).getDay()+1] || 'Sun';
            break;
        case dateType === 'poslezavtra':
        case dateType === 'послезавтра':
            weekDay = weekDays[(new Date()).getDay()+2] || weekDays[((new Date()).getDay()+2) - 6] || '?';
            break;
        default:
            weekDay = weekDays[weekDaysRus.indexOf(dateType)];
    }

    weather.find({ search: city, degreeType: 'C' }, function(err, result) {
        if(err) console.log(err);
        resolve({
            ...result[0].forecast.find(cast => cast.shortday === weekDay),
            city,
            dateType
        })
    });
}

getDateForecastWeather('Бердичев', {
    "id": "1078308975947067",
    "name": "date_time",
    "role": "date_time",
    "start": 15,
    "end": 21,
    "body": "послезавтра",
    "confidence": 1,
    "entities": [],
    "value": "послезавтра",
    "type": "value"
});
