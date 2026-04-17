const randomAnswer = require('./randomAnswer.function');
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
🏠 ${page.raw.title} (${daily.weather[0].description}, ${daily.rain ? '🌨 снег' : daily.snow ? '🌧 дождь' : 'без осадков'})
📅  ${new Date(timeMs).toLocaleDateString()}
🌡 Утро  ${Math.round(daily.temp.morn)}°C (ощущается ${Math.round(daily.feels_like.morn)}°C)
🌡 День  ${Math.round(daily.temp.day)}°C (ощущается ${Math.round(daily.feels_like.day)}°C)
🌡 Вечер ${Math.round(daily.temp.eve)}°C (ощущается ${Math.round(daily.feels_like.eve)}°C)
🌡 Ночь  ${Math.round(daily.temp.night)}°C (ощущается ${Math.round(daily.feels_like.night)}°C)   
🌪 ${Math.round(daily.wind_speed)} метра в секунду         
🌫 Давление:   ${pressure} мм. рт. ст.
💧 Влажность:  ${daily.humidity }%
🌥 Облачность: ${daily.clouds}%

🧐 ${randomAnswer(getWeatherJokes(daily))}`
}

    const pressure = Math.round(result.current.pressure / 133.3224) * 100; // Pa -> мм. рт. ст.
    return `
🏠 ${page.raw.title} (${result.current.weather[0].description}, ${result.current.rain ? '🌨 снег' : result.current.snow ? '🌧 дождь' : 'без осадков'})
🌡 ${Math.round(result.current.temp)}°C (ощущается ${Math.round(result.current.feels_like)}°C)
🌪 ${Math.round(result.current.wind_speed)} метра в секунду
🌫 Давление:   ${pressure} мм. рт. ст.
💧 Влажность:  ${result.current.humidity }%
🌥 Облачность: ${result.current.clouds}% 
    
🤔 ${randomAnswer(getWeatherJokes(result.current))}`;
}

// ${hourly.map(hour => {
//     return `${new Date(hour.dt * 1000).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false })} 🌡 ${Math.round(hour.temp)}°C (ощущается ${Math.round(hour.feels_like)}°C)`
// }).join('')}

const getWeatherJokes = function(weather) {
    if(weather.snow) return snow;
    if(weather.rain) return rain;

    const temp = weather.temp || weather.temp.max;
    if(+temp > 27) return hot;
    if(+temp < -5) return cold;

    if(+weather.wind_speed >= 15) return bad;
    if(+weather.clouds >= 80) return bad;

    return good;
}

const good = [
    'Последнее слово в прогнозе всегда остается за погодой.',
    'Синоптики ошибаются лишь один раз. Но каждый день',
    'Такая хорошая погода, надо подвинуть компьютер ближе к окну.',
    'Не бывает плохой погоды, бывает плохое настроение.',
    'Как быстро меняется погода! Не успеешь захотеть одну одежду, как уже пора хотеть другую...',
    'Хорошая погода ко многому обязывает. Например, сообщать всем, что погода сегодня превосходная.',
]

const bad = [
    'Как же так назвать эту погоду, да так, чтоб не обидеть матушку-природу.',
    'У природы нет плохой погоды. Да и хорошей что-то давно не было...',
    'К сожалению, в отпуске плохая погода бывает не только в выходные',
    'Сами вы плохие! (с) Погода.',
    'Погода водке не помеха.',
    'Все так жалуются на погоду. Как будто кроме погоды у вас всё хорошо.',
    'Посмотрела погоду — «ясно». Вышла на улицу — «понятно»...',
    'Погода — это гордая стерва… Ей всё-равно, что она вам не нравится…'
]

const hot = [
    'Вы так накрасились... Вам не жарко?!',
    'Ты посмотри, какая погода на улице! Солнце, тепло, весной пахнет! Давай сходим куда-нибудь в пивбар!',
    'Врачи рекомендуют много пить. Вот даже возразить им нечего…',
    'Чем сильнее летняя жара, тем сложнее смотреть девушкам в глаза',
    'Жарко - это когда хочешь включuть кондицuoнер, а оказывается, что он уже включен',
    'Синоптики ошибаются лишь один раз. Но каждый день',
    '- Солнце, жара, вода, песок, что еще нужно?\n' +
    '- Цемент!',
];
const cold = [
    'Коротко о погоде: "Дубак", господа.',
    'Причина холодной погоды - глобальное потепление.',
    'Коротко о погоде: бр-р-р-р…',
    'В такую погоду мне простo необходима тёплая и толстая девушка',
    'Прогнозы погоды никогда не ошибаются, они только путают время и место.',
    'Походу этой зимой мы будем кидаться асфальтом..',
    'Долбанные холода. Скорее бы жара долбанная',
    'Бог тоже любит юмор. Особенно прогноз погоды.',
    'Сегодня такая погода, что сижу и думаю: а что если глинтвейн сделать на водке?..',
];

const rain = [
    'Шаман бы за такую погоду получил бы в бубен.',
    'И еще о погоде. А не пора ли нам строить ковчег??',
    'Одни люди гуляют под дождем, другие мокнут.',
    'Зонт — вещь, которую надо брать с собой, чтобы не пошел дождь.',
    'Сегодня такая погода, что заправлять кровать вообще нет смысла....',
    'Если погода не изменится, то этим летом можно будет не загореть, а заржаветь.'
];

const snow = [
    'Начался сезон "кто рано встаёт, тот снег большой лопатой гребёт".',
    'Сегодня такая погода, что заправлять кровать вообще нет смысла...',
    'На улице такая погода, что оливье захотелось',
];