// https://www.googleapis.com/youtube/v3/search?part=snippet&q=Natural Spirit - Під серпом часу&type=album&key=AIzaSyDwtT9D89yM6-MOo7AkYX3D2Zz4r0Hr-bI

module.exports = async function searchAlbum(artist, album) {
    global.LOG.info('YOUTUBE API | FETCHING: album');

    let response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(`${artist} - ${album}`)}&type=album&key=${global.YOUTUBE_API}`);
    response = await response.json();

    if(response.error || !response.items.length) {
        global.LOG.error('YOUTUBE API | searchAlbum ERROR: ', response.error.message);
        return '';
    }

    global.LOG.info('YOUTUBE API | SUCCESS: results -> ', response.items.length);

    return {
        link: `https://music.youtube.com/channel/${response.items[0].snippet.channelId}`,
        videoLink: `https://www.youtube.com/watch?v=${response.items[0].id.videoId}`,
        description: response.items[0].snippet.description,
        icon: response.items[0].snippet.thumbnails['high'].url,
        channelTitle: response.items[0].snippet.channelTitle
    };
}