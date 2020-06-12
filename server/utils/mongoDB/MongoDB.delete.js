module.exports = async function(collectionName, collection, _id) {
    try {
        const document = await collection.findOne({ _id });

        if(!document) throw new Error(`🌼 MONGO DB | No such document '${_id}' in collection ${collectionName}`);

        await collection.deleteOne( { _id });

        if(document.uid) {
            const userDocuments = await collection.find({ uid: document.uid }).toArray();
            global.SSE.send(JSON.stringify({
                    [document.uid]: {
                        [collectionName]: userDocuments
                    }
                }
            ));
        }

        console.log(`🌼 MONGO DB | '${_id}' deleted from collection`);
    } catch(e) {
        throw new Error(e.toString());
    }
}