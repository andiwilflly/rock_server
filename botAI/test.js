

// // Imports the Google Cloud client library
//     const language = require('@google-cloud/language');
//
// // Creates a client
//     const client = new language.LanguageServiceClient();
//
//     /**
//      * TODO(developer): Uncomment the following line to run this code.
//      */
// // const text = 'Your text to analyze, e.g. Hello, world!';
//
// // Prepares a document, representing the provided text
//     const document = {
//         content: "Валера Карпин хочет ту отдохнуть а Путин нет",
//         type: 'PLAIN_TEXT',
//     };
//
// // Detects entities in the document
//     const [result] = await client.analyzeEntities({document});
//
//     const entities = result.entities;
//
//     entities.forEach(entity => {
//         console.log(entity.name);
//         console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
//         if (entity.metadata && entity.metadata.wikipedia_url) {
//             console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}`);
//         }
//     });



async function quickstart() {

    console.log('Tokens:');
}

quickstart();