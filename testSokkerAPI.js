const jsdom = require("jsdom");
let request = require('request');
request = request.defaults({ jar: true });


const { JSDOM } = jsdom;


request.post({
    url: 'https://sokker.org/start',
    form: {
        ilogin: 'benelone',
        ipassword: 'password'
    }
}, function (error, response, body) {

    if(response.statusCode === 302 && response.headers && response.headers.location) {
        console.log('logged in...');

        request(`http://sokker.org/player/PID/37314989`, (error, response, body)=> {
            const dom = new JSDOM(body);
            const document = dom.window.document;
            console.log(document.querySelector(".h5.title-block-1 a").textContent);
        });
    } else {
        console.log('error', error);
    }
});