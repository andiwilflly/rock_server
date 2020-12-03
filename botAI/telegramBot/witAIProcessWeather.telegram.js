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


    a = {
        "coord": {
            "lon": 32.1,
            "lat": 49.03
        },
        "weather": [
            {
                "id": 804,
                "main": "Clouds",
                "description": "пасмурно",
                "icon": "04d"
            }
        ],
        "base": "stations",
        "main": {
            "temp": 1.49,
            "feels_like": -2.79,
            "temp_min": 1.49,
            "temp_max": 1.49,
            "pressure": 1026,
            "humidity": 91,
            "sea_level": 1026,
            "grnd_level": 1011
        },
        "visibility": 10000,
        "wind": {
            "speed": 3.32,
            "deg": 110
        },
        "clouds": {
            "all": 100
        },
        "dt": 1606991844,
        "sys": {
            "country": "UA",
            "sunrise": 1606973242,
            "sunset": 1607003762
        },
        "timezone": 7200,
        "id": 707052,
        "name": "Каменка",
        "cod": 200
    }

    const result = await getAllWeather(locationEntity.value);

    if(!result.weather) return ctx.reply(JSON.stringify(result, null, 3));

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