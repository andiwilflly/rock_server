const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "study-ua",
        "private_key_id": "1da06ef8590e717cfd141f2bd154607dabde6cbf",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDq1qBKZPY/Drz/\nhSTh1JrYts7L7C4zoQQ7WpvvmgF9VCD5nvRTtZeKEsHbP1v58WFs6LwPnXdzeQls\nZS1icDOLZpVy/fMpxND7jyPCVGOMRJzN+jvLXeFIt/BLIKQLaJNwp7C8fcw/nMIX\ngptmmJL4SYnpvGbX4wj/ftPWQG2NH5+1yfpO2I1AgI0MYgh4on42yo26Ep/+TMiy\nQUraAJmXTe6LpwQT+Ti3twlDXH+4x32YkTn/KdGEjR5mwjUi6T2GPn4eaYyvdJwa\n0smyj7mw1RCCNxe1Z4tknImZvrKqFq8y1a2GFRjeryoWV+SsLuooAbTSxHX4CSYV\nuwQZDL6rAgMBAAECggEABvz207mBzMorr5x1RrV+Tuw2gFtf28nZbjBTd/01bCOG\n860NbwXcifXmIbF9LPvhpU1rqZ9K9BTqLEXHSvWbYw7DbCLIcjnyg60OKFs9ULak\nX+P0lMGpBL8mF5ltQdwNZYqbHl2aW8FwOSWtNo/Ciw1NKept7DpL60AJhIelFINW\nZ1UuU0o2ZfwOY4I1nDwkORWh5J6+ZvSqgHGEPVjcE598og73gpePNJecd+nbb5Wp\np//nxhqj9lVnjiSdPav7nbZS+/22PSv9KAItVSnVJebkU62lXZ8TVeKuwiMO2W9y\nNPHEoio1rmIwPKq7nbJyWgCrKAC54tpwItyxAT9cWQKBgQD20UsYmpIj6gGMmtDI\n0OH6PhuONTE+a8aoetYYsbqkLYGtk6lamLn2pIGsavxLTtaeTfsTdUtvC32QlPHq\ncu7w55lx/QHdEO69LEnmZQtjfeH5niVcrhGDjBW+dvBje+H3TcNM5MXonk514FZ5\nV9c95hq3m7cydTZZRIGpwXaTlwKBgQDzkz4NuO4bz5+je9vsxDeltDudsNm9Bvn5\n2G4tjfeWkvE2L4R6n7sLcoiUOWSfPBbG+OPWudvNl2oXZV0Q+G9Tq2K3wx2D7Avn\nzk3MatjOedRQ99DMotTXfdgESajErgyLbBkTN3mVClalZYda1pQ1I0mup5B+ju+0\n8IPMthrADQKBgQCOU+KaLYhYbXi3PA9pvgqR437AYqwi8sN8JFmRo+udASDml1/x\nfmC+ed7NLmSOiMf6Qb2nWtxFDLs7xKg8KkrfYK57rQqGEF2beQ6kbWBD3zOQXkHt\nT/OJiB6B1tSIicekdJNKpCH8Ik3ca6FyF9VnPGnrtz/NOQo+L+MVoRpfwQKBgEWI\nsj1OnsLXubX9BOKJfW1Tj3VL6EzbMf+ONp3Qmm6k0jFqzUIIWWhCMRVHcR84EzSI\nFtrUwhfl8sZtDG1szrMvCQZ2r/VaLGfncDQ8CFqhUuguZrAUh/hgl4tZz9Ed8rzW\nhi4DNzVB90xOOJ7JBRRKV52BfnFysqGPy8Bj+Cz9AoGBALsx0EkEuk6ZE1hDZyNM\n+W1ZGDVLccv8vLNIhHE0/gFAqhLAAnHiVM9wVaUVOw7abywuxrbxpk1kVASbrcI4\nt6Gs3BYyKm8RHnz8rCSWbANvoQvAwI+HtHI/I5ljOEe8lcYe6vG1Jvg3vfmFm5ED\n1HJUts0vpeHq+Nf4bgQdSgmo\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-eizf8@study-ua.iam.gserviceaccount.com",
        "client_id": "108332537565954181460",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-eizf8%40study-ua.iam.gserviceaccount.com"
    })
});

const storage = admin.storage();
const bucket = storage.bucket(`gs://study-ua.appspot.com`);

module.exports = async function (req, res) {
    const usersResult = await admin.auth().listUsers(500);

    let response = {};
    try {
        for(const user of usersResult.users) {
            response[user.uid] = {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
                lastLogin: user.metadata.lastRefreshTime
            };

            const results = await bucket.getFiles({ prefix: `usersDocs/${user.uid}` });
            const files = results[0];

            for(const file of files) {
                if(!response[user.uid].files) response[user.uid].files = [];
                const fileUrls = await file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                });
                response[user.uid].files.push({
                    fileUrl: fileUrls[0],
                    name: file.name,
                    type: file.metadata.contentType,
                    created: file.metadata.timeCreated,
                })
            }
        }

        res.send(response);
    } catch (e) {
        res.send(JSON.stringify(e));
    }
}

