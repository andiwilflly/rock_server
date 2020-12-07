const randomAnswer = require('./randomAnswer.function');
const fetch = require("node-fetch");
const WIKI = require('wikijs').default;


module.exports = async function getWeatherCity(city, timeMs, isFeature = false) {
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
🏠 ${city} (${daily.weather[0].description}, ${daily.rain ? '🌨 снег' : daily.snow ? '🌧 дождь' : 'без осадков'})
📅  ${new Date(timeMs).toLocaleDateString()}
🌡 Утро  ${Math.round(daily.temp.morn)}°C (ощущается ${Math.round(daily.feels_like.morn)}°C)
🌡 День  ${Math.round(daily.temp.day)}°C (ощущается ${Math.round(daily.feels_like.day)}°C)
🌡 Вечер ${Math.round(daily.temp.eve)}°C (ощущается ${Math.round(daily.feels_like.eve)}°C)
🌡 Ночь  ${Math.round(daily.temp.night)}°C (ощущается ${Math.round(daily.feels_like.night)}°C)            
🌫 Давление:   ${pressure} мм. рт. ст.
💧 Влажность:  ${daily.humidity }%
🌥 Облачность: ${daily.clouds}%

${randomAnswer(jokesList)}`
}

    const pressure = Math.round(result.current.pressure / 133.3224) * 100; // Pa -> мм. рт. ст.
    return `
🏠 ${city} (${result.current.weather[0].description}, ${result.current.rain ? '🌨 снег' : result.current.snow ? '🌧 дождь' : 'без осадков'})
🌡 ${Math.round(result.current.temp)}°C (ощущается ${Math.round(result.current.feels_like)}°C)
🌪 ${Math.round(result.current.wind_speed)} метра в секунду
🌫 Давление:   ${pressure} мм. рт. ст.
💧 Влажность:  ${result.current.humidity }%
🌥 Облачность: ${result.current.clouds}% 
    
${randomAnswer(jokesList)}`;
}

// ${hourly.map(hour => {
//     return `${new Date(hour.dt * 1000).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false })} 🌡 ${Math.round(hour.temp)}°C (ощущается ${Math.round(hour.feels_like)}°C)`
// }).join('')}

const jokesList = [
    'Начался сезон "кто рано встаёт, тот снег большой лопатой гребёт".',
    'Вы так накрасились... Вам не жарко?!',
    'Жарко - это когда хочешь включuть кондицuoнер, а оказывается, что он уже включен',
    'Чем сильнее летняя жара, тем сложнее смотреть девушкам в глаза',
    'Долбанные холода. Скорее бы жара долбанная',
    'Сегодня такая погода, что сижу и думаю: а что если глинтвейн сделать на водке?..',
    'На улице такая погода, что оливье захотелось',
    '- Солнце, жара, вода, песок, что еще нужно?\n' +
    '- Цемент!' +
    'К сожалению, в отпуске плохая погода бывает не только в выходные',
    'Если погода не изменится, то этим летом можно будет не загореть, а заржаветь.'
];