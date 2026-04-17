const { JSDOM } = require("jsdom");


(async () => {
    const loginResponse = await fetch('https://sokker.org/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ilogin: 'benelone', ipassword: 'password' }),
        redirect: 'manual'
    });
    const cookies = loginResponse.headers.get('set-cookie') || '';

    if(loginResponse.status === 302 && loginResponse.headers.get('location')) {
        console.log('logged in...');

        const response = await fetch('http://sokker.org/player/PID/37314989', {
            headers: { Cookie: cookies }
        });
        const body = await response.text();
        const dom = new JSDOM(body);
        const document = dom.window.document;
        console.log(document.querySelector(".h5.title-block-1 a").textContent);
    } else {
        console.log('error');
    }
})();
