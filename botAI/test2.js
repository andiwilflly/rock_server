let db = {
    "data": [
        {
            "phrase": ["What do you do for a living","What is your job", "How do you make money"],
            "response": ["I'm an engineer", "sometimes I work as a cook"],
            "phraseType": "job",
            "implies": [
                "movie"
            ],
            "target": [],
            "meta": {
                "style": [
                    "nosearch"
                ],
                "group": "job"
            }
        },
        {
            "phrase": ["What is your favorite movie"],
            "response": ["Aliens"],
            "phraseType": "favorite movie",
            "implies": [
                "movie"
            ],
            "target": [],
            "meta": {
                "style": [
                    "nosearch"
                ],
                "group": "movie"
            }
        },
        {
            "phrase": ["You are smart", "You look nice", "you are good",
                "DAMN", "this is great", "this is awesome", "this is fantastic",
                "this rules"],
            "response": ["thanks", "I know", "duhh"],
            "phraseType": "compliment",
            "implies": [
                "compliment"
            ],
            "target": [],
            "meta": {
                "style": [
                    "nosearch"
                ],
                "group": "compliment"
            }
        },
        {
            "phrase": ["do you have family?", "do you have any kids", "do you have any children"],
            "response": ["I have 32 kids, they drive me nuts."],
            "phraseType": "family",
            "implies": [
                "family"
            ],
            "target": [],
            "meta": {
                "style": [
                    "nosearch"
                ],
                "group": "family"
            }
        }]
}

let { BasicBot } = require('neural-chatbot');
let { UserData } = require('neural-phrasex')

let conf = {
    database: db,
    doc: {
        description: {
            name: "jimmy",
        },
    },
}
let bot = new BasicBot()
await bot.initialize(conf)

let userData = new UserData();
userData.initialize()

let ans = await bot.getResult(phrase, userData)

console.log('ans', ans)