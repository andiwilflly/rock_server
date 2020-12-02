const WIKI = require('wikijs').default;

let wikiAPI = null;

async function setup() {
    wikiAPI = await WIKI({ apiUrl: 'https://ru.wikipedia.org/w/api.php' });

    console.log('WIKI API | Ready');
}

setup();

module.exports = async function(phrase, ansWitAI) {
    const page = await wikiAPI.find(phrase);


    const mainImage = await page.mainImage();
    const summary = await page.summary();
    const coordinates = await page.coordinates();


}