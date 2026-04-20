const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));


module.exports = async function setupBrowser() {
    const browser = await puppeteer.launch({
        headless: "new",
        ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"],
        devtools: false, // not needed so far, we can see websocket frames and xhr responses without that.
        defaultViewport: { //--window-size in args
            width: 1280,
            height: 882
        },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // use /tmp instead of /dev/shm (64MB on cheap VPS)
            '--disable-gpu',           // no GPU process in headless
            '--disable-extensions',
        ]
    });
    global.LOG.info('BROWSER | SETUP: success');

    return browser;
}
