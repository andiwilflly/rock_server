const YandexMusicApi = require('yandex-music-api');
const api = new YandexMusicApi();


async function start(artistName, albumName) {
    console.log('✨ YANDEX PARSER:START...');

    await api.init({username: 'andiwillfly', password: 'Ward121314'});

    let matchedAlbum = await api.search(`${encodeURIComponent(artistName)} - ${encodeURIComponent(albumName)}`);

    matchedAlbum = matchedAlbum.best;

    if(!matchedAlbum) return {
        error: `Album [${artistName} - ${albumName}] not found`,
        source: 'yandex'
    }

    console.log('✨ YANDEX PARSER:END', `${artistName} - ${albumName}`);
    return {
        source: 'yandex',
        type: matchedAlbum.type,
        version: matchedAlbum.result.version,
        albumName: matchedAlbum.result.title,
        artistName: matchedAlbum.result.artists[0].name,
        link: `https://music.yandex.ua/album/${matchedAlbum.result.id}`,
        trackCount: matchedAlbum.result.trackCount,
        genre: matchedAlbum.result.genre,
        image: `https://${matchedAlbum.result.coverUri.replace('%%', 'm1000x1000')}`
    };
}

module.exports = start;