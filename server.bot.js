const path = require('path');


const DB = {
    "data": [
        ...require(path.resolve(__dirname, 'botAI/data/main.json')),
        // ...require(path.resolve(__dirname, 'botAI/data/questions.json')),
        // ...require(path.resolve(__dirname, 'botAI/data/greetings.json')),
        // ...require(path.resolve(__dirname, 'botAI/data/interests.json')),
        // ...require(path.resolve(__dirname, 'botAI/data/komrad.json')),
        // ...require(path.resolve(__dirname, 'botAI/data/jokes.json')),
        // ...require(path.resolve(__dirname, 'botAI/data/animals.json')),
        // ...require(path.resolve(__dirname, 'botAI/data/responses.json'))
    ]
};

let { BasicBot } = require('neural-chatbot');
let { UserData } = require('neural-phrasex');

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

console.log(`🤖 BOT AI | Start`);
async function start() {
    console.log(`🤖 BOT AI | Setup basicBot...`);
    AI.BOT = new BasicBot()
    await AI.BOT.initialize(conf)

    AI.userData = new UserData();
    AI.userData.initialize();

    console.log(`🤖 BOT AI | BasicBot ready...`);

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
