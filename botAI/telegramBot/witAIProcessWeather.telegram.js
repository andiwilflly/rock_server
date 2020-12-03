const fs = require('fs');
const WIKI = require('wikijs').default;
const weather = require('openweather-apis');
const randomAnswer = require('./functions/randomAnswer.function');


const KEY = 'e0ec6da3ca0381df4cc5564f7053ca85';

weather.setLang('ru');
weather.setAPPID(KEY);

module.exports = async function(ctx, witAns) {
    const locationEntity = witAns.entities['wit$location:location'] ? witAns.entities['wit$location:location'][0] : null;

    if(!locationEntity) return ctx.reply(randomAnswer([
        'Какой город?',
        'В каком городе ты живешь?',
        'Нужно указать город',
        'Обязательно нужно писать город и можно также задать день недели (например погода в четверг)',
        'Прогноз погоды в каком городе тебя интересует?'
    ]));

    ctx.reply(randomAnswer([
        '🌤 опрашивем погодных экспертов...',
        'выезжаем на место для определения погоды...',
        `открываем https://sinoptik.ua/${locationEntity.value}...`,
        'опрашивем погодных экспертов... ☂',
        'подготавливаем термометры... 🌡',
        '🌪🌪🌪 выезжаем на место...',
    ]));

    const result = await getAllWeather(locationEntity.value);

    ctx.reply(JSON.stringify(result, null, 3));

    return ctx.reply(`
        🏠 ${result.name} (${result.weather.description})
        температура:    🌡 ${Math.round(result.weather.temp)}℃ (ощущается как ${Math.round(result.weather.feels_like)}℃)
        влажность:      ${result.clouds.humidity }%
        облачность:     ${result.clouds.all > 50 ? '🌥 облачно' : '🌤 безоблачно' }
        скорость ветра: 🌪 ${Math.round((result.wind.speed * 60 * 60) / 1000)} км в час
    `);
}


async function getAllWeather(origCity) {

    weather.setCity(origCity);
    return new Promise(async resolve => {
        await weather.getAllWeather(async function(err, res) {
            if(res.cod === '404') {
               try {
                   const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
                   const page = await wikiAPI.search(origCity, 2);

                   const city = page.results.sort((a,b)=> a.length - b.length)[0];

                   weather.setCity(city);
                   weather.getAllWeather(function(err, res) {
                       resolve(res);
                   });
               } catch(e) {
                   resolve(e);
               }
            } else {
                resolve(res);
            }
        });
    })
}

(async function (){
    await getAllWeather('каменке');
})();