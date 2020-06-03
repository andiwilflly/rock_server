const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://andiwillfly:ward121314@cluster0-etaet.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri);


let isConnectedClient = false;
module.exports = async function() {
    if(isConnectedClient) console.error(`🌼 MONGO DB | CONNECTED (cache)`);
    if(isConnectedClient) return client;
    try {
        await client.connect();
        console.log(`🌼 MONGO DB | CONNECTED`);
        isConnectedClient = true;
    } catch (e) {
        console.error(`🌼 MONGO DB | ERROR: \n ${e}`);
    }

    return client;
}
