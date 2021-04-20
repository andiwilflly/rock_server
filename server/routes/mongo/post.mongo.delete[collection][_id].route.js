// Utils
const MongoDBDelete = require('../../utils/mongoDB/MongoDB.delete');


module.exports = async function(req, res) {
    const collection = global[`MONGO_COLLECTION_${req.params.collection.toUpperCase()}`];

    if(!collection) return res.status(500).send({ error: `🌼 MONGO DB | No such collection: ${req.params.collection}`})

    try {
        await MongoDBDelete(req.params.collection, collection, req.params._id);
        res.status(200).send({ success: `🌼 MONGO DB | deleted from '${req.params.collection}'` });
    } catch(error) {
        console.log(`🌼 MONGO DB | delete error '${error}'`);
        res.status(500).send({ error: error.toString() });
    }
}