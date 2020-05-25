var YandexMusicApi = require('yandex-music-api');

var api = new YandexMusicApi();

api.init({username: 'andiwillfly', password: 'Ward121314'}).then(async function(auth) {

    const x = await api.search('One Desire - Midnight Empire');

    console.log(auth, x);
})