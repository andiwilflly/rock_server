const fetch = require("node-fetch");
const animals = require('random-animals-api');

async function test() {
    // const data = ['cat', 'fox', 'bird', 'dog', 'bunny', 'lizard', 'owl', 'tiger', 'shiba', 'lion', 'duck', 'panda', 'redPanda', 'penguin'];
    //
    // for(let i = 0; i < data.length ; i++) {
    //     try {
    //         console.log(await animals[data[i]](), i, data[i]);
    //     } catch {
    //         // console.log('EMPTY: ', i, data[i]);
    //     }
    // }

    function _randomInteger(min, max) {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
    }

    let response = await fetch('http://umorili.herokuapp.com/api/get?name=new+anekdot&num=200');
    response = await response.json();

    const index = _randomInteger(0, response.length);

    console.log(index, response[index], response.length)
}

test();