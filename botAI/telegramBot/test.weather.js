const WIKI = require('wikijs').default;


async function getWeatherCity(city, timeMs=Date.now()) {
    const wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });
    const page = await wikiAPI.find(city);

    const { lat, lon } = await page.coordinates();

    console.log(lat, lon, Math.round(timeMs/1000));

    let result = await fetch(`http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&lang=ru&units=metric&dt=${Math.round(timeMs/1000)}&appid=e0ec6da3ca0381df4cc5564f7053ca85`)
    result = await result.json();

    const dayNumber = new Date(timeMs).getDate();
    const hourly = result.hourly.filter(hour => hour.dt *1000 > Date.now() && dayNumber === new Date(hour.dt *1000).getDate());

    function formatWeather(day) {
        const pressure = Math.round(day.pressure / 133.3224) * 100; // Pa -> мм. рт. ст.
        const date = new Date(day.dt * 1000);
        const options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        };

        return `
            ⏰  ${date.toLocaleString('en-US', options)}       
            🌡 ${Math.round(day.temp)}°C (ощущается как ${Math.round(day.feels_like)}°C)
            🌫 Атмосферное давление: ${pressure} мм. рт. ст.
            💧 Влажность воздуха: ${day.humidity }%
            🌥 Облачность: ${day.clouds}%
            🌪 ${Math.round(day.wind_speed)} метра в секунду
        `;
    }

    return `
        🏠 ${city} (${result.current.weather[0].description})
        ${ formatWeather(result.current)}
        По часам:
        ${hourly.map(hour => formatWeather(hour)).join(' ')}
    `;
}

getWeatherCity("Бердичев")