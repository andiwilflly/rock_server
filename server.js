const express = require('express');
// const yandexParser = require('./@parsers/yandex.parser');
const googleParser = require('./@parsers/google.parser');

const app = express();


app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/find/:group/:album', async function (req, res) {
    console.log('GROUP: ', req.params.group, 'ALBUM:', req.params.album);
    //const yandex = await yandexParser(req.params.group, req.params.album);
    const google = await googleParser(req.params.group, req.params.album);
    // const yandex = await yandexParser('Asking Alexandria', 'Down To Hell');
    res.send({
        google
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
