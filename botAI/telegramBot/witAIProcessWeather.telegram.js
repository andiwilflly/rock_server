const Fuse = require('fuse.js');
const fetch = require("node-fetch");
const WIKI = require('wikijs').default;
const weather = require('openweather-apis');
const randomAnswer = require('./functions/randomAnswer.function');

// TODO: https://openbase.io/js/dark-sky-api

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
        await weather.getAllWeather(async function(err, res) {
            // if(res.cod === '404') {
               try {
                   const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
                   const page = await wikiAPI.search(origCity, 2);

                   const city = page.results.sort((a,b)=> a.length - b.length)[0];

                   if(dateEntity) {
                       getDateForecastWeather(city, dateEntity, resolve);
                   } else {
                       resolve(await getWeatherCity(city, Date.now()));
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


async function getWeatherCity(city, timeMs, isFeature = false) {
    const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
    const page = await wikiAPI.find(city);

    const { lat, lon } = await page.coordinates();

    let result = await fetch(`http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&lang=ru&units=metric&appid=e0ec6da3ca0381df4cc5564f7053ca85`)
    result = await result.json();

    const dayNumber = new Date(timeMs).getDate();
    const hourly = result.hourly.filter(hour => hour.dt *1000 > Date.now() && dayNumber === new Date(hour.dt *1000).getDate());
    const daily = result.daily.filter(day => new Date(day.dt * 1000).getDay() === new Date(timeMs).getDay())[0];

    if(isFeature) {
        const pressure = Math.round(daily.pressure / 133.3224) * 100; // Pa -> мм. рт. ст.
        return `
        
                🏠 ${city} (${daily.weather[0].description})
                📅  ${new Date(timeMs).toLocaleDateString()}
                🌡 Утро  ${Math.round(daily.temp.morn)}°C (ощущается как ${Math.round(daily.feels_like.morn)}°C)
                🌡 День  ${Math.round(daily.temp.day)}°C (ощущается как ${Math.round(daily.feels_like.day)}°C)
                🌡 Вечер ${Math.round(daily.temp.eve)}°C (ощущается как ${Math.round(daily.feels_like.eve)}°C)
                🌡 Ночь  ${Math.round(daily.temp.night)}°C (ощущается как ${Math.round(daily.feels_like.night)}°C)            
                🌫 Атмосферное давление: ${pressure} мм. рт. ст.
                💧 Влажность воздуха: ${daily.humidity }%
                🌥 Облачность: ${daily.clouds}%
               ${daily.rain ? '🌨 Снег' : daily.snow ? '🌧 Дождь' : 'Без осадков'}   
            `
    }

    const pressure = Math.round(result.current.pressure / 133.3224) * 100; // Pa -> мм. рт. ст.
    return `
    
            🏠 ${city} (${result.current.weather[0].description})
            🌡 ${Math.round(result.current.temp)}°C (ощущается как ${Math.round(result.current.feels_like)}°C)
            🌪 ${Math.round(result.current.wind_speed)} метра в секунду
            🌫 Атмосферное давление: ${pressure} мм. рт. ст.
            💧 Влажность воздуха: ${result.current.humidity }%
            🌥 Облачность: ${result.current.clouds}%   
            ${result.current.rain ? '🌨 Снег' : result.current.snow ? '🌧 Дождь' : 'Без осадков'}   
        ${hourly.map(hour => {
            return `${new Date(hour.dt * 1000).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false })} 🌡 ${Math.round(hour.temp)}°C (ощущается как ${Math.round(hour.feels_like)}°C)
            `
        }).join('')}
    `;
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