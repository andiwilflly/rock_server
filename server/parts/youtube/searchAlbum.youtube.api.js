const Fuse = require('fuse.js');
const fs = require('fs');

const options = {
    includeScore: true,
    shouldSort: true,
    threshold: 0.4,
    keys: ["snippet.title"]
};


module.exports = async function searchAlbum(artist, album) {
    global.LOG.info('YOUTUBE API | FETCHING: album');

    let channels = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(`${artist}`)}&type=channel&key=${global.YOUTUBE_API}&maxResults=1`);
    channels = await channels.json();

    if(channels.error || !channels.items.length) {
        global.LOG.error('YOUTUBE API | searchChannel ERROR: ', channels.error.message);
        return '';
    }

    // global.LOG.info('YOUTUBE API | SUCCESS: results -> ', channels.items.length);

    let playlists = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channels.items[0].id.channelId}&key=${global.YOUTUBE_API}`);
    playlists = await playlists.json();

    fs.writeFileSync('searchAlbumLog.json', JSON.stringify(playlists.items));

    const fuse = new Fuse(playlists.items, options);
    let matchedAlbum = fuse.search(album)[0];

    if(!matchedAlbum) {
        global.LOG.error('YOUTUBE API | searchAlbum ERROR: ' + album);
        return '';
    }

    let image = '[not found]';
    try {
        image = matchedAlbum.item.snippet.thumbnails['maxres'].url
    } catch {}
    return {
        link: `https://music.youtube.com/playlist?list=${matchedAlbum.item.id}`,
        image,
        title: matchedAlbum.item.snippet.title,
        createdAt: matchedAlbum.item.snippet.publishedAt,
        description: matchedAlbum.item.snippet.description
    };
}