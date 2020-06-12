// Utils
const MongoDBSave = require('../../utils/mongoDB/MongoDB.save');


module.exports = async function(req, res) {
    if(!req.body._id) return res.status(500).send({ error: `🌼 MONGO DB | No '_id' provided in document`});

    const collection = global[`MONGO_COLLECTION_${req.params.collection.toUpperCase()}`];
    if(!collection) return res.status(500).send({ error: `🌼 MONGO DB | No such collection: ${req.params.collection}`})

    try {
        await MongoDBSave(req.params.collection, collection, req.body);
        res.status(200).send({ success: `🌼 MONGO DB | saved to '${req.params.collection}'` });
    } catch(error) {
        console.log(`🌼 MONGO DB | save error '${error}'`);
        res.status(500).send({ error: `🌼 MONGO DB | save error '${error}'` });
    }
}