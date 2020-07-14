

module.exports = async function(req, res) {
    const collection = global[`MONGO_COLLECTION_${req.params.collection.toUpperCase()}`];

    if(!collection) return res.status(500).send({ error: `🌼 MONGO DB | No such collection: ${req.params.collection}`})

    try {
        await collection.remove({});
        res.status(200).send({ success: `🌼 MONGO DB | removed collection '${req.params.collection}'` });
    } catch(error) {
        console.log(`🌼 MONGO DB | remove collection error '${error}'`);
        res.status(500).send({ error: error.toString() });
    }
}