const express = require('express');
const yandexParser = require('./@parsers/yandex.parser');

const app = express();


app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/find/:group/:album', async function (req, res) {
    const yandex = await yandexParser('Asking Alexandria', 'Down To Hell');
    res.send({
        yandex
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
