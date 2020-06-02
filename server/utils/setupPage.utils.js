module.exports = async function(browser) {
    const page = await browser.newPage();
    const block_ressources = ['image', 'stylesheet', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (
            block_ressources.indexOf(request.resourceType) > 0
            // Be careful with above
            || request.url().includes('.jpg')
            || request.url().includes('.jpeg')
            || request.url().includes('.png')
            || request.url().includes('.gif')
            || request.url().includes('.css')
        )
            request.abort();
        else
            request.continue();
    });

    return page;
}