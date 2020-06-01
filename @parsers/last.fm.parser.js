const Fuse = require('fuse.js');

const options = {
    includeScore: true,
    shouldSort: true,
    threshold: 0.4,
    keys: ["artist"]
};

async function start(artistName, albumName) {
    console.log('✨ LAST.FM PARSER:START...', albumName, artistName);

    let albums = await fetch(`http://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(albumName)}&api_key=${'8ecb1efa682d2b9fb834f9e757e4fc0b'}&format=json`);
    albums = await albums.json();

    const fuse = new Fuse(albums.results.albummatches.album, options);

    let matchedAlbum = fuse.search(artistName)[0];

    if(!matchedAlbum) return {
        error: `Error ${artistName} - ${albumName} (not found)`,
        source: 'lastfm'
    }

    matchedAlbum = matchedAlbum.item;

    console.log('✨ LAST.FM PARSER:END');
    return {
        link: matchedAlbum.url,
        image: matchedAlbum.image[matchedAlbum.image.length-1]['#text'],
        source: 'lastfm'
    };
}

module.exports = start;