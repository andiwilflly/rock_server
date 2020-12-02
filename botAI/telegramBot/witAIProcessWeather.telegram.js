const fs = require('fs');
const WIKI = require('wikijs').default;
const weather = require('openweather-apis');

const KEY = 'e0ec6da3ca0381df4cc5564f7053ca85';

weather.setLang('ru');
weather.setAPPID(KEY);

module.export = async function(witAns) {
    const entities = Object.keys(witAns.entities).reduce((res, key)=> {
        res.push({
            ...witAns.entities[key][0],
            key: key.split(':')[1]
        })
        return res;
    }, []).sort((a,b)=> a.start - b.start);

    if(!entities.length) return 'Какой город?';

    return await getAllWeather(entities[0].entities);
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