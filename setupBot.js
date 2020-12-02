const path = require('path');


const DB = {
    "data": [
        ...require(path.resolve(__dirname, 'botAI/DB/main.json')),
        ...require(path.resolve(__dirname, 'botAI/DB/questions.json')),
        ...require(path.resolve(__dirname, 'botAI/DB/greetings.json')),
        ...require(path.resolve(__dirname, 'botAI/DB/interests.json')),
        ...require(path.resolve(__dirname, 'botAI/DB/komrad.json')),
        ...require(path.resolve(__dirname, 'botAI/DB/jokes.json')),
        ...require(path.resolve(__dirname, 'botAI/DB/animals.json')),
        ...require(path.resolve(__dirname, 'botAI/DB/weather.json')),
        ...require(path.resolve(__dirname, 'botAI/DB/responses.json'))
    ]
};

let { BasicBot } = require('neural-chatbot');
let { UserData } = require('neural-phrasex')

let conf = {
    database: DB,
    doc: {
        description: {
            name: "jimmy",
        },
    },
}

const AI = {
    BOT: null,
    userData: null
}
async function start() {
    AI.BOT = new BasicBot()
    await AI.BOT.initialize(conf)

    AI.userData = new UserData();
    AI.userData.initialize();

    const telegramBot = require('./botAI/telegramBot');
    telegramBot(AI);
}

start();

const express = require('express');
const app = express()
const port = 3001

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
