const fetch = require("node-fetch");

function _randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

module.exports = async function() {
    let response = await fetch('http://umorili.herokuapp.com/api/get?name=new+anekdot&num=100');
    response = await response.json();

    return response[_randomInteger(0, response.length-1)]
        .elementPureHtml
        .replace(/[`~!@#$%^*()_|+\-=?:'",.<>{}\[\]\\\/]/gi, '')
        .replace(/[br]/gi, '')
        .replace(/[&copy;]/gi, '')
        .replace(/[&quot;]/gi, '')
        .replace(/[&laquo;]/gi, '')
        .replace(/[&raquo;]/gi, '') + ' 🔥';
}