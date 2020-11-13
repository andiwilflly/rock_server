const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const AI = {
    BOT: null,
    ready: false,
};

// https://kartaslov.ru/%D0%BA%D0%B0%D0%BA%D0%B8%D0%BC%D0%B8-%D0%B1%D1%8B%D0%B2%D0%B0%D1%8E%D1%82/%D1%84%D1%80%D0%B0%D0%B7%D1%8B%20%D1%82%D0%B8%D0%BF%D0%B0
async function init(CLIENT) {
    let { BasicBot } = require('neural-chatbot');
    let { UserData } = require('neural-phrasex');
    const DB = {
        "data": [
            ...require('./DB/main.json'),
            ...require('./DB/questions.json'),
            ...require('./DB/greetings.json'),
            ...require('./DB/interests.json'),
        ]
    };

    let conf = {
        database: DB,
        doc: {
            description: {
                name: "jimmy",
            },
        }
    }
    CLIENT.emit('AI.BOT:msg', '🤖 BOT AI | Setting up...');
    console.log(`🤖 BOT AI | setting up...`);
    AI.BOT = new BasicBot();

    await AI.BOT.initialize(conf);
    CLIENT.emit('AI.BOT:msg', '🤖 BOT AI | Ready');
    AI.userData = new UserData();
    AI.userData.initialize();
    CLIENT.emit('AI.BOT:msg', '🤖 BOT AI | userData initialized');
    console.log(`🤖 BOT AI | userData initialized`);
    AI.ready = true;

    const telegramBot = require('./telegramBot');
    telegramBot(AI);
}


app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', async function(CLIENT) {
    console.log('🤖 BOT AI | Socket client connected...', AI.ready);
    CLIENT.emit('AI.BOT:msg', '🤖 BOT AI | Loading...');

    AI.ready ? CLIENT.emit('AI.BOT:msg', '🤖 BOT AI | Ready') : await init(CLIENT);

    CLIENT.on('AI.BOT:ask', async function(phrase) {
        console.log('AI.BOT:ask |', phrase);

        if(!AI.BOT) return CLIENT.emit('AI.BOT:answer', '🤖 BOT AI | Not ready yet...');
        let ans = await AI.BOT.getResult(phrase, AI.userData);
        CLIENT.emit('AI.BOT:answer', ans.confidence < 0.5 ? 'Уточни вопрос, я плохо поинмать' : ans);
    });
});


server.listen(3000);
