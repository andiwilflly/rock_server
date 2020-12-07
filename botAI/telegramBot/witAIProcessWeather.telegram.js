const Fuse = require('fuse.js');
const WIKI = require('wikijs').default;
const weather = require('openweather-apis');
const randomAnswer = require('./functions/randomAnswer.function');
const getWeatherCity = require('./functions/getWeatherCity.function');

// TODO: Советы на разную погоду

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

    return ctx.reply(result);
}


async function getAllWeather(origCity, dateEntity = {}) {

    weather.setCity(origCity);
    return new Promise(async resolve => {
        try {
            const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
            const page = await wikiAPI.search(origCity, 2);

            const city = page.results.sort((a,b)=> a.length - b.length)[0];

            if(dateEntity) {
                await getDateForecastWeather(city, dateEntity, resolve);
            } else {
                resolve(await getWeatherCity(city, Date.now()));
            }
        } catch(e) {
            resolve('error: ' + e);
        }
    })
}



async function getDateForecastWeather(city, dateEntity, resolve) {
    const dateType = fuse.search(dateEntity.value)[0] ? fuse.search(dateEntity.value)[0].item : '';

    let weekDay = '';
    switch (true) {
        case dateType === 'сегодня':
            weekDay = weekDays[(new Date()).getDay()];
            break;
        case dateEntity.value === 'poslezavtra':
        case dateEntity.value === 'послезавтра':
            weekDay = weekDays[(new Date()).getDay()+2] || weekDays[((new Date()).getDay()+2) - 6] || '?';
            break;
        case dateType === 'zavtra':
        case dateType === 'завтра':
            weekDay = weekDays[(new Date()).getDay()+1] || 'Sun';
            break;
        default:
            weekDay = weekDays[weekDaysRus.indexOf(dateType)];
    }

    console.log('nextDate:', nextDate(weekDays.indexOf(weekDay)));

    resolve(await getWeatherCity(city, nextDate(weekDays.indexOf(weekDay)), true));
}


function nextDate(dayIndex) {
    const today = new Date();
    today.setDate(today.getDate() + (dayIndex - 1 - today.getDay() + 7) % 7 + 1);
    return new Date(today).getTime();
}

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

// (async function () {
//     console.log(await getWeatherCity('Киев', Date.now(), false));
// })();