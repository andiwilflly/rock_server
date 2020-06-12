module.exports = async function(req, res) {
    const collection = global[`MONGO_COLLECTION_${req.params.collection.toUpperCase()}`];

    if(!collection) return res.status(500).send({ error: `🌼 MONGO DB | No such collection: ${req.params.collection}`})

    try {
        const userDocuments = req.params.uid ?
            await collection.find({ uid: req.params.uid }).toArray()
            :
            await collection.find().toArray();
        res.status(200).send(userDocuments);
    } catch(error) {
        console.log(`🌼 MONGO DB | delete error '${error}'`);
        res.status(500).send({ error: error.toString() });
    }
}