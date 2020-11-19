const animals = require('random-animals-api');

async function test() {
    const data = ['cat', 'fox', 'bird', 'dog', 'bunny', 'lizard', 'owl', 'tiger', 'shiba', 'lion', 'duck', 'panda', 'redPanda', 'penguin'];

    for(let i = 0; i < data.length ; i++) {
        try {
            console.log(await animals[data[i]](), i, data[i]);
        } catch {
            // console.log('EMPTY: ', i, data[i]);
        }
    }
}

test();