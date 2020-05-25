const YandexMusicApi = require('yandex-music-api');
const api = new YandexMusicApi();


async function start(browser, artistName, albumName) {
    console.log('✨ YANDEX PARSER:START...');

    await api.init({username: 'andiwillfly', password: 'Ward121314'});

    let matchedAlbum = await api.search(`${artistName} - ${albumName}`, { type: 'album' });
    matchedAlbum = matchedAlbum.albums.results[0];

    if(!matchedAlbum) return {
        error: `Album [${artistName} - ${albumName}] not found`,
        source: 'yandex'
    }

    console.log('✨ YANDEX PARSER:END', `${artistName} - ${albumName}`);
    return {
        source: 'yandex',
        albumName: matchedAlbum.title,
        artistName: matchedAlbum.artists[0].name,
        artistImage: `https://${matchedAlbum.artists[0].cover.uri.replace('%%', 'm1000x1000')}`,
        link: `https://music.yandex.ua/album/${matchedAlbum.id}`,
        trackCount: matchedAlbum.trackCount,
        genre: matchedAlbum.genre,
        image: `https://${matchedAlbum.coverUri.replace('%%', 'm1000x1000')}`
    };
}

module.exports = start;