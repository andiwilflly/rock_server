const Fuse = require('fuse.js');

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
    'послезавтра',
];

const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    threshold: 0.4,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
};


const fuse = new Fuse(data, options);

console.log(fuse.search("воскресенья"));

const weather = require('weather-js');

weather.find({search: 'San Francisco, CA', degreeType: 'C'}, function(err, result) {
    if(err) console.log(err);

    console.log(JSON.stringify(result, null, 2));
});
