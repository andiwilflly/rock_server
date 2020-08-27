let request = require('request');
request = request.defaults({ jar: true });


module.exports = function (cb = ()=> {}) {

    request.post({
        url: 'https://sokker.org/start',
        form: {
            ilogin: 'benelone',
            ipassword: 'password'
        }
    }, function (error, response, body) {

        if(response.statusCode === 302 && response.headers && response.headers.location) {
            console.log('SOKKER | logged in...');
            cb(error, response, body);
        } else {
            console.log('SOKKER | logged in...');
            cb(error, response, body);
        }
    });
}