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
                       resolve(await getWeatherCity(city));
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
            weekDay = weekDays[(new Date()).getDay()-1];
            break;
        case dateType === 'zavtra':
        case dateType === 'завтра':
            weekDay = weekDays[(new Date()).getDay()] || 'Mon';
            break;
        case dateType === 'poslezavtra':
        case dateType === 'послезавтра':
            weekDay = weekDays[(new Date()).getDay()+1] || weekDays[((new Date()).getDay()+1) - 5] || '?';
            break;
        default:
            weekDay = weekDays[weekDaysRus.indexOf(dateType)];
    }

    console.log('nextDate:', nextDate(weekDays.indexOf(weekDay)));

    resolve(await getWeatherCity(city, nextDate(weekDays.indexOf(weekDay)), true));
}


async function getWeatherCity(city, timeMs=Date.now(), isFeature = false) {
    const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
    const page = await wikiAPI.find(city);

    const { lat, lon } = await page.coordinates();

    console.log(lat, lon, new Date(timeMs));

    let result = await fetch(`http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&lang=ru&units=metric&dt=${Math.round(timeMs/1000)}&appid=e0ec6da3ca0381df4cc5564f7053ca85`)
    result = await result.json();

    const dayNumber = new Date().getDate();
    const hourly = result.hourly.filter(hour => hour.dt*1000 > new Date().getTime() && dayNumber === new Date(hour.dt *1000).getDate());

    function formatWeather(day, showDetails = true) {
        const pressure = Math.round(day.pressure / 133.3224) * 100; // Pa -> мм. рт. ст.
        const date = new Date(day.dt * 1000);
        const options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        };

        if(!showDetails) {
            return `
                ⏰  ${date.toLocaleString('en-US', {
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: false
                })}
                🌡 ${Math.round(day.temp)}°C (ощущается как ${Math.round(day.feels_like)}°C)        
            `;
        }
        return `
            ⏰  ${date.toLocaleString('en-US', options)}       
            🌡 ${Math.round(day.temp)}°C (ощущается как ${Math.round(day.feels_like)}°C)
            🌪 ${Math.round(day.wind_speed)} метра в секунду
            🌫 Атмосферное давление: ${pressure} мм. рт. ст.
            💧 Влажность воздуха: ${day.humidity }%
            🌥 Облачность: ${day.clouds}%
        `;
    }

    return `
        🏠 ${city} (${result.current.weather[0].description})
        ${formatWeather(result.current)}
        По часам:
        ${ isFeature ? '' : hourly.map(hour => formatWeather(hour, false)).join(' ')}
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


(async function () {
    console.log(new Date(nextDate(0)))
    console.log(await getWeatherCity('Киев', nextDate(0)));
})();