
function _randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}


module.export = async function(witAns) {
    const entities = Object.keys(witAns.entities).reduce((res, key)=> {
        res.push({
            ...witAns.entities[key][0],
            key: key.split(':')[1]
        })
        return res;
    }, []).sort((a,b)=> a.start - b.start);

    const ansIndex = _randomInteger(0, ANSWERS.length-1);
    const subjects = entities.filter(e => e.key === 'message_subject');
    const verbs = entities.filter(e => e.key === 'verb');
    const ratings = entities.filter(e => e.key === 'rating');
}


// "ты с какого сарая будешь?"
const ANSWERS = [
    'В смысле {{rating}} {{subject}} {{verb}} ??',
    'ты постоянно спрашиваешь про {{subject}}, я устал отвечать уже',
    'Не {{verb}}!'
]


const ans = {
    "text": "ты с какого сарая будешь?",
    "intents": [
        {
            "id": "669012820475869",
            "name": "questions",
            "confidence": 0.9774
        }
    ],
    "entities": {
        "verb:verb": [
            {
                "id": "382547883189507",
                "name": "verb",
                "role": "verb",
                "start": 18,
                "end": 24,
                "body": "будешь",
                "confidence": 0.975,
                "entities": [],
                "value": "будешь",
                "type": "value"
            }
        ],
        "wit$message_subject:message_subject": [
            {
                "id": "649964052339905",
                "name": "wit$message_subject",
                "role": "message_subject",
                "start": 12,
                "end": 17,
                "body": "сарая",
                "confidence": 0.863,
                "entities": [],
                "suggested": true,
                "value": "сарая",
                "type": "value"
            }
        ],
        "rating:rating": [
            {
                "id": "698292907559181",
                "name": "rating",
                "role": "rating",
                "start": 5,
                "end": 11,
                "body": "какого",
                "confidence": 0.9363,
                "entities": [],
                "value": "какого",
                "type": "value"
            }
        ],
        "wit$contact:contact": [
            {
                "id": "202803214555577",
                "name": "wit$contact",
                "role": "contact",
                "start": 0,
                "end": 2,
                "body": "ты",
                "confidence": 0.9769,
                "entities": [],
                "suggested": true,
                "value": "ты",
                "type": "value"
            }
        ]
    },
    "traits": {
        "wit$sentiment": [
            {
                "id": "5ac2b50a-44e4-466e-9d49-bad6bd40092c",
                "value": "neutral",
                "confidence": 0.5269
            }
        ]
    }
}