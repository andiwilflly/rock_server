const admin = require("firebase-admin");
const firebase = require('firebase');


const serviceAccount = require("../../newrockbot-firebase-adminsdk-mb9q7-2767b30f25.json");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://newrockbot.firebaseio.com"
});
global.LOG.info('firebase ADMIN initialized...');


// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDJjTBG3HPioF_WeLURsCUnuWHahxWxAu8",
    authDomain: "newrockbot.firebaseapp.com",
    databaseURL: "https://newrockbot.firebaseio.com",
    projectId: "newrockbot",
    storageBucket: "newrockbot.appspot.com",
    messagingSenderId: "189865837490",
    appId: "1:189865837490:web:7f5be511e85d79c8af1aab",
    measurementId: "G-LEHMM6F8DW"
};
firebase.initializeApp(firebaseConfig);

global.LOG.info('firebase APP initialized...');

