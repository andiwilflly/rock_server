//const login =  'andiwillfly@gmail.com';
//const pass =  '121314ward';
const translit = require("../server/utils/translit");

const EMBED_TOKEN_URL = 'https://open.spotify.com/embed/track/3HHqVJHqwgkxWhOQ4MhLB6';
const PATHFINDER_URL  = 'https://api-partner.spotify.com/pathfinder/v1/query';
const BUNDLE_INDEX_URL = 'https://open.spotify.com/';
// Extracted from web-player bundle; auto-refreshed at runtime if Spotify rotates it
let SEARCH_HASH = 'f78953bf9207d73493c27284103f5aeb6e728876d5793851bf79bc706127ff70';

const HEADERS_BASE = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Origin': 'https://open.spotify.com',
    'Referer': 'https://open.spotify.com/',
};

let _token = null;
let _tokenExp = 0;

async function getAnonToken() {
    if (_token && Date.now() < _tokenExp - 60_000) return _token;
    const res = await fetch(EMBED_TOKEN_URL, { headers: { ...HEADERS_BASE, 'Accept': 'text/html' } });
    const html = await res.text();
    const tokenMatch = html.match(/"accessToken":"(BQ[^"]+)"/);
    const expMatch   = html.match(/"accessTokenExpirationTimestampMs":(\d+)/);
    _token    = tokenMatch ? tokenMatch[1] : null;
    _tokenExp = expMatch ? parseInt(expMatch[1]) : Date.now() + 30 * 60_000;
    return _token;
}

async function refreshSearchHash() {
    const res = await fetch(BUNDLE_INDEX_URL, { headers: HEADERS_BASE });
    const html = await res.text();
    const bundleUrl = (html.match(/https:\/\/open\.spotifycdn\.com\/cdn\/build\/web-player\/web-player\.[a-f0-9]+\.js/) || [])[0];
    if (!bundleUrl) return;
    const bundle = await fetch(bundleUrl, { headers: HEADERS_BASE }).then(r => r.text());
    const m = bundle.match(/"assistedCurationSearch","query","([a-f0-9]{64})"/);
    if (m) SEARCH_HASH = m[1];
    console.log('✨ SPOTIFY Refresh search hash ', SEARCH_HASH);
}

async function pathfinderSearch(token, term) {
    const variables = JSON.stringify({ term, catalogue: '', limit: 10, includeAudiobooks: false });
    const extensions = JSON.stringify({ persistedQuery: { version: 1, sha256Hash: SEARCH_HASH } });
    const url = `${PATHFINDER_URL}?operationName=assistedCurationSearch&variables=${encodeURIComponent(variables)}&extensions=${encodeURIComponent(extensions)}`;
    const res = await fetch(url, {
        headers: { ...HEADERS_BASE, 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'app-platform': 'WebPlayer', 'spotify-app-version': '1.2.89.310' },
    });
    if (res.status === 400) {
        // Hash likely rotated — refresh and signal caller to retry
        await refreshSearchHash();
        return null;
    }
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data?.searchV2?.albumsV2?.items || []).map(i => i.data.uri);
}

async function getAlbumMeta(albumId) {
    const res = await fetch(`https://open.spotify.com/embed/album/${albumId}`, { headers: { ...HEADERS_BASE, 'Accept': 'text/html' } });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
    if (!m) return null;
    try {
        const entity = JSON.parse(m[1]).props?.pageProps?.state?.data?.entity;
        if (!entity) return null;
        const images = entity.visualIdentity?.image || entity.coverArt?.sources || [];
        const image = images.reduce((a, b) => (!a || (b.maxWidth || b.width || 0) > (a.maxWidth || a.width || 0)) ? b : a, null)?.url || null;
        return {
            name: entity.name,
            artist: entity.subtitle || (entity.artists?.[0]?.name) || '',
            link: `https://open.spotify.com/album/${albumId}`,
            image,
        };
    } catch { return null; }
}

async function fetchFromApi(group, album) {
    const token = await getAnonToken();
    if (!token) return { source: 'spotify', error: 'Failed to obtain anon token' };

    let uris = await pathfinderSearch(token, `${group} ${album}`);
    if (uris === null) {
        // Hash was rotated; retry once with refreshed hash
        uris = await pathfinderSearch(token, `${group} ${album}`) || [];
    }
    if (!uris.length) return { source: 'spotify', error: `Album not found: ${group} - ${album}` };

    const groupLower = group.toLowerCase();
    const albumLower = album.toLowerCase();

    const metas = await Promise.all(uris.slice(0, 6).map(uri => getAlbumMeta(uri.split(':')[2])));
    const valid = metas.filter(Boolean);

    const byArtist = valid.filter(m => m.artist.toLowerCase() === groupLower);
    if (!byArtist.length) return { source: 'spotify', error: `Artist not found: ${group}` };

    const match = byArtist.find(m => m.name.toLowerCase() === albumLower)
               || byArtist.find(m => m.name.toLowerCase().includes(albumLower));
    if (!match) return { source: 'spotify', error: `Album not found: ${group} - ${album}` };

    return {
        source: 'spotify',
        link: match.link,
        ...(match.image && { image: match.image }),
    };
}


async function parsePage(browser, group, album) {
    const page = await browser.newPage();
    try {
        page.setDefaultNavigationTimeout(50000);

        await page.goto(`https://open.spotify.com/search/${group}/artists`, {
            waitUntil: 'networkidle0'
        });
        await new Promise(r => setTimeout(r, 500));
        const trGroup = translit(group);
        const artistLink = await page.evaluate((_group, _trGroup)=> {
            const artistEl = [...document.querySelectorAll('a[href*="artist/"]')]
                .find($el => {
                    const cardTitle = $el.querySelector('[data-encore-id="cardTitle"]');
                    const name = (cardTitle ? cardTitle.getAttribute('title') || cardTitle.innerText : null)
                        || $el.innerText || $el.getAttribute('title') || '';
                    const nameLower = name.toLowerCase().trim();
                    return nameLower === _group.toLowerCase() || nameLower === _trGroup.toLowerCase();
                });
            if(!artistEl) return null;
            return artistEl.getAttribute('href');
        }, group, trGroup);

        if (!artistLink) {
            //todo remove
            let debug = await page.evaluate(()=> {
                return  document.querySelector('body').innerText;
            });

            return {
                source: 'spotify',
                debug: debug,
                error: `Group not found: https://open.spotify.com/search/${group}`
            };
        }

        await page.goto(`https://open.spotify.com${artistLink}`, {
            waitUntil: 'networkidle0'
        });
        await new Promise(r => setTimeout(r, 500));

        const albumResult = await page.evaluate((_album)=> {
            const albumtEl = [...document.querySelectorAll('a[href*="album/"]')]
                .find($el => {
                    const cardTitle = $el.querySelector('[data-encore-id="cardTitle"]');
                    const name = (cardTitle ? cardTitle.getAttribute('title') || cardTitle.innerText : null)
                        || $el.innerText || $el.getAttribute('title') || '';
                    return name.toLowerCase().includes(_album.toLowerCase());
                });

            if(!albumtEl) return null;

            const cardEl = albumtEl.parentElement.parentElement.parentElement;
            const img = cardEl ? cardEl.querySelector('img') : null;
            const imgSrc = img ? img.getAttribute('src') : null;

            return { href: albumtEl.getAttribute('href'), image: imgSrc ? imgSrc.replace('00001e02', '0000b273') : null };
        }, album);

        if(!albumResult) return { source: 'spotify', error: `Album not found:  https://open.spotify.com/search/${group}` };

        return {
            source: 'spotify',
            link: `https://open.spotify.com${albumResult.href}`,
            image: albumResult.image,
        };
    } catch(e) {
        return { source: 'spotify', error: e.toString() };
    } finally {
        await page.close().catch(() => {});
    }
}

async function start(browser, group, album) {
    console.log('✨ SPOTIFY PARSER:START...');

    const apiResult = await fetchFromApi(group, album).catch(e => ({ source: 'spotify', error: e.toString() }));
    // if (apiResult.link) {
    //     console.log('✨ SPOTIFY PARSER:END (api)');
    //     return apiResult;
    // }

    // console.log('✨ SPOTIFY PARSER: api miss, fallback to browser');
    // const response = await parsePage(browser, group, album);

    console.log('✨ SPOTIFY PARSER:END');
    return apiResult;
    /*const spotifyResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(`${group} - ${album}`)}&type=album&limit=1`, {
        headers: { 'Authorization': `Bearer ${global.SPOTIFY_TOKEN}` }
    });
    if (!spotifyResponse.ok) {
        const errorText = await spotifyResponse.text();
        console.error(`✨ SPOTIFY PARSER: API error ${spotifyResponse.status}: ${errorText}`);
        return await parsePage(browser, group, album);
    }
    let matchedAlbum = await spotifyResponse.json();

    matchedAlbum = matchedAlbum.albums.items[0];// || matchedAlbum.tracks.items[0]);

    console.log('✨ SPOTIFY PARSER:END');

    if (!matchedAlbum || matchedAlbum.artists[0].name.toLowerCase() != group.toLowerCase() || !matchedAlbum.name.toLowerCase().includes(album)) {
        return await parsePage(browser, group, album);
    }
    return {
        link: matchedAlbum.external_urls.spotify,
        name: matchedAlbum.name,
        artistName: matchedAlbum.artists[0].name,
        artistLink: matchedAlbum.artists[0].external_urls.spotify,
        albumId: matchedAlbum.id,
        image: matchedAlbum.images ? matchedAlbum.images[0].url : '[No track image]',//or matchedAlbum.album.images[0].url
        directTrackLink: matchedAlbum.preview_url,
        releaseDate: matchedAlbum.release_date,
        totalTracks: matchedAlbum.total_tracks,
        type: matchedAlbum.type,
        source: 'spotify'
    };*/
}

module.exports = start;
