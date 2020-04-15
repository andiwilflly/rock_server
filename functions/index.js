const express = require('express');
const functions = require('firebase-functions');
// const mime = require('mime');
const puppeteer = require('puppeteer');

// const app = express();
// app.use(function cors(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     // res.header('Content-Type', 'application/json;charset=utf-8');
//     // res.header('Cache-Control', 'private, max-age=300');
//     next();
// });
//
// // const beforeMB = process.memoryUsage().heapUsed / 1e6;
// // puppeteer.launch().then(browser => {
// //   app.locals.browser = browser;
// //   const afterMB = process.memoryUsage().heapUsed / 1e6;
// //   console.log('used', beforeMB - afterMB + 'MB');
// // })
//
// app.get('/test', (req, res) => {
//     res.status(200).send('test');
// });
//
// // Init code that gets run before all request handlers.
// app.all('*', async (req, res, next) => {
//     res.locals.browser = await puppeteer.launch({args: ['--no-sandbox']});
//     next(); // pass control on to router.
// });


// exports.test = functions.https.onRequest(app);

// const translate = require('./translate.function');

const cors = require('cors')({origin: true});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        response.send({h: "Hello from Firebase!"});
    })
});
