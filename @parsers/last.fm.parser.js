async function start(artistName, albumName) {

    let albums = await fetch(`http://ws.audioscrobbler.com/2.0/?method=album.search&album=${albumName}&api_key=${'8ecb1efa682d2b9fb834f9e757e4fc0b'}&format=json`);
    albums = await albums.json();

    console.log('✨ LAST.FM PARSER:START...');

    const matchedAlbum = albums.results.albummatches.album.find(album => {

        return album.name.toLowerCase() === albumName.toLowerCase() &&
               album.artist.toLowerCase() === artistName.toLowerCase();
    });

    if(!matchedAlbum) return {
        error: `Album [${artistName} - ${albumName}] not found`,
        source: 'lastfm'
    }

    console.log('✨ LAST.FM PARSER:END');
    return {
        link: matchedAlbum.url,
        image: matchedAlbum.image[matchedAlbum.image.length-1]['#text'],
        source: 'lastfm'
    };
}

module.exports = start;