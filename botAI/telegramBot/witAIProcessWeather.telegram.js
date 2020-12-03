const fs = require('fs');
const WIKI = require('wikijs').default;
const weather = require('openweather-apis');
const randomAnswer = require('./functions/randomAnswer.function');


const KEY = 'e0ec6da3ca0381df4cc5564f7053ca85';

weather.setLang('ru');
weather.setAPPID(KEY);

module.export = async function(ctx, witAns) {
    const entities = Object.keys(witAns.entities).reduce((res, key)=> {
        res.push({
            ...witAns.entities[key][0],
            key: key.split(':')[1]
        })
        return res;
    }, []).sort((a,b)=> a.start - b.start);

    if(!entities.length) return ctx.reply(randomAnswer([
        'Какой город?',
        'В каком городе ты живешь?',
        'Нужно указать город',
        'Обязательно нужно писать город и можно также задать день недели (например погода в четверг)',
        'Прогноз погоды в каком городе тебя интересует?'
    ]));

    ctx.reply(randomAnswer([
        'опрашивем погодных экспертов...',
        'выезжаем на место для определения погоды',
        `открываем https://sinoptik.ua/${entities[0].entities}`,
        'опрашивем погодных экспертов...',
        'выезжаем на место...',
    ]));

    return ctx.reply(await getAllWeather(entities[0].entities));
}


async function getAllWeather(origCity) {

    weather.setCity(origCity);
    return new Promise(async resolve => {

        await weather.getAllWeather(async function(err, res) {

            if(res.cod === '404') {
                const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
                const page = await wikiAPI.search(origCity, 2);
                const city = page.results.sort((a,b)=> a.length - b.length)[0];
                console.log('city', city);

                weather.setCity(city);
                weather.getAllWeather(function(err, res) {
                    resolve(JSON.stringify(res, null, 3));
                });
            } else {
                resolve(JSON.stringify(res, null, 3));
            }
        });
    })
}