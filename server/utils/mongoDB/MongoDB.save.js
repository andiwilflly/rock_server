module.exports = async function(collectionName, collection, data) {
    try {
        await collection.insertOne(data);

        if(data.uid) {
            const userDocuments = await collection.find({ uid: data.uid }).toArray();
            // global.SSE.send(JSON.stringify({
            //         [data.uid]: {
            //             [collectionName]: userDocuments
            //         }
            //     }
            // ));
        } else {
            console.log(`🌼 MONGO DB | can't send SSE because no data.uid`, data);
        }

        console.log(`🌼 MONGO DB | saved to collection '${collectionName}'`);
    } catch(e) {
       throw new Error(e);
    }
}
