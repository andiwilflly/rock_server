const Fuse = require('fuse.js');

const options = {
    // isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    // includeMatches: true,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
   threshold: 0.4,
    // distance: 100,
    // useExtendedSearch: false,
    keys: [
        "artist"
    ]
};

async function start(artistName, albumName) {
    console.log('✨ LAST.FM PARSER:START...', albumName, artistName);

    let albums = await fetch(`http://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(albumName)}&api_key=${'8ecb1efa682d2b9fb834f9e757e4fc0b'}&format=json`);
    albums = await albums.json();

    const fuse = new Fuse(albums.results.albummatches.album, options);

    console.log('✨ LAST.FM PARSER:END');
    return fuse.search(artistName);
}

module.exports = start;