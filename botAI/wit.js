const { Wit, log } = require('node-wit');

const client = new Wit({
    accessToken: "H4GRPOXJOG5VAP7NEA5AX5BSIWXS64N3",
    logger: new log.Logger(log.DEBUG) // optional
});

console.log(client.message('кто такой Виталий наливкин'));