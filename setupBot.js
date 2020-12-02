const DB = {
    "data": [
        ...require('./botAI/DB/main.json'),
        ...require('./botAI/DB/questions.json'),
        ...require('./botAI/DB/greetings.json'),
        ...require('./botAI/DB/interests.json'),
        ...require('./botAI/DB/komrad.json'),
        ...require('./botAI/DB/jokes.json'),
        ...require('./botAI/DB/animals.json'),
        ...require('./botAI/DB/weather.json'),
        ...require('./botAI/DB/responses.json')
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
