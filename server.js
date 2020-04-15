var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/find/:group/:album', function (req, res) {
    // request.params.group;
    // request.params.album;
    res.send('find!', req.params.group, req.params.album);
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!');
});
