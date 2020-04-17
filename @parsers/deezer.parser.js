const login = 'andiwillfly@gmail.com';
const pass = '&S9Kg1J?';

// dzr_uniq_id=dzr_uniq_id_frceccb8f5a681c3be702306ac61ab2d0a8c54b0; consentStatistics=1; consentMarketing=1; cookieConsent=BOx835yOx835yA7ABDENDF-AAAAvJ7_______9______9uz_Ov_v_f__33e8__9v_l_7_-___u_-33d4u_1vf99yfm1-7etr3tp_87ues2_Xur__71__3z3_9pxP78k89r7337Ew_v-_v-b7BCPN9Y3v-8I; _ga=GA1.2.915308485.1587042674; _gid=GA1.2.386595470.1587042674; _fbp=fb.1.1587042673987.236515744; G_ENABLED_IDPS=google; dz_lang=en; ab.storage.sessionId.5ba97124-1b79-4acc-86b7-9547bc58cb18=%7B%22g%22%3A%227f362230-c903-fe8d-f52e-84869fdcc147%22%2C%22e%22%3A1587044640276%2C%22c%22%3A1587041855224%2C%22l%22%3A1587042840276%7D
async function parsePage(browser, group, album) {
    try {
        const page = await browser.newPage();

        await page.goto(`https://www.deezer.com/us/login`, {
            waitUntil: 'networkidle2'
        });
        await page.waitFor(100);
        console.log(`✨ DEZZER PARSER | login page loaded...`);

        // dzr_uniq_id: "dzr_uniq_id_frceccb8f5a681c3be702306ac61ab2d0a8c54b0"
        // consentStatistics: 1
        // consentMarketing: 1
        // cookieConsent: "BOx835yOx835yA7ABDENDF-AAAAvJ7_______9______9uz_Ov_v_f__33e8__9v_l_7_-___u_-33d4u_1vf99yfm1-7etr3tp_87ues2_Xur__71__3z3_9pxP78k89r7337Ew_v-_v-b7BCPN9Y3v-8I"
        // _ga: "GA1.2.915308485.1587042674"
        // _gid: "GA1.2.386595470.1587042674"
        // _fbp: "fb.1.1587042673987.236515744"
        // G_ENABLED_IDPS: "google"
        // dz_lang: "en"
        const cookies = [{
            'name': 'dzr_uniq_id',
            'value': 'dzr_uniq_id_frceccb8f5a681c3be702306ac61ab2d0a8c54b0'
        },{
            'name': 'cookieConsent',
            'value': "BOx835yOx835yA7ABDENDF-AAAAvJ7_______9______9uz_Ov_v_f__33e8__9v_l_7_-___u_-33d4u_1vf99yfm1-7etr3tp_87ues2_Xur__71__3z3_9pxP78k89r7337Ew_v-_v-b7BCPN9Y3v-8I"
        },{
            'name': 'dz_lang',
            'value': 'en'
        }];

        await page.setCookie(...cookies);

        // await page.focus('#login_mail')
        // await page.keyboard.type(login);
        //
        // await page.focus('#login_password')
        // await page.keyboard.type(pass);
        //
        // await page.waitFor(3000);
        // // await page.click('#login_form_submit');
        // await page.evaluate((selector) => document.querySelector('#login_form_submit').click());
        //
        // await page.waitFor(30000);

        return {
            source: 'https://www.deezer.com',
            link: `https://play.google.com${"albumLink"}`
        };
    } catch(e) {
        return { source: 'https://www.deezer.com', error: e.toString() };
    }
}


async function start(browser, group, album) {
    console.log('✨ DEZZER PARSER:START...');

    const response = await parsePage(browser, group, album);

    console.log('✨ DEZZER PARSER:END', response);
    return response;
}

module.exports = start;