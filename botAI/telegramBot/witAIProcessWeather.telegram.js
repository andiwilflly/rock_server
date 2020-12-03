const fs = require('fs');
const WIKI = require('wikijs').default;
const weather = require('openweather-apis');
const randomAnswer = require('./functions/randomAnswer.function');


const KEY = 'e0ec6da3ca0381df4cc5564f7053ca85';

weather.setLang('ru');
weather.setAPPID(KEY);

module.exports = async function(ctx, witAns) {
    const locationEntity = witAns.entities['wit$location:location'];

    if(!locationEntity) return ctx.reply(randomAnswer([
        'Какой город?',
        'В каком городе ты живешь?',
        'Нужно указать город',
        'Обязательно нужно писать город и можно также задать день недели (например погода в четверг)',
        'Прогноз погоды в каком городе тебя интересует?'
    ]));

    ctx.reply(randomAnswer([
        'опрашивем погодных экспертов...',
        'выезжаем на место для определения погоды',
        `открываем https://sinoptik.ua/${locationEntity.value}`,
        'опрашивем погодных экспертов...',
        'подготавливаем термометры',
        'выезжаем на место...',
    ]));

    ctx.reply(locationEntity + ' ????');

    ctx.reply('ctiy: ', locationEntity.value);
    return ctx.reply(await getAllWeather(locationEntity.value));
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
                       resolve(JSON.stringify(res, null, 3));
                   });
               } catch(e) {
                   resolve(e);
               }
            } else {
                resolve(JSON.stringify(res, null, 3));
            }
        });
    })
}

(async function (){
    await getAllWeather('каменке');
})();