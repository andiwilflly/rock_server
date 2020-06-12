module.exports = async function(collectionName, collection, data) {
    try {
        await collection.insertOne(data);

        if(data.uid) {
            const documents = await collection.find().toArray();
            global.SSE.send([JSON.stringify({
                [data.uid]: {
                    [collectionName]: documents
                }
            }
            )]);
        }

        console.log(`🌼 MONGO DB | saved to collection '${collectionName}'`);
    } catch(e) {
       throw new Error(e);
    }
}