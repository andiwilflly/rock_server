const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));


module.exports = async function setupBrowser() {
    const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"],
        devtools: false, // not needed so far, we can see websocket frames and xhr responses without that.
        defaultViewport: { //--window-size in args
            width: 1280,
            height: 882
        },
        args: [
            // '--disable-canvas-aa', // Disable antialiasing on 2d canvas
            // '--disable-2d-canvas-clip-aa', // Disable antialiasing on 2d canvas clips
            // '--disable-gl-drawing-for-tests', // BEST OPTION EVER! Disables GL drawing operations which produce pixel output. With this the GL output will not be correct but tests will run faster.
            // '--disable-dev-shm-usage', // ???
            // '--no-zygote', // wtf does that mean ?
            // '--use-gl=swiftshader', // better cpu usage with --use-gl=desktop rather than --use-gl=swiftshader, still needs more testing.
            // '--enable-webgl',
            // '--hide-scrollbars',
            // '--mute-audio',
            // '--no-first-run',
            // '--disable-infobars',
            // '--disable-breakpad',
            '--window-size=1280,1024', // see defaultViewport
            '--no-sandbox', // meh but better resource comsuption
            '--disable-setuid-sandbox'
        ] // same
    });
    global.LOG.info('BROWSER | SETUP: success');

    return browser;
}
