const express = require('express');
const morgan = require('morgan');   // logger
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const { response } = require('express');
const schedule = require('node-schedule');

// Import Firebase
// const { initializeApp } = require('firebase/app');
// const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } = require('firebase/auth');
// const { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField } = require('firebase/firestore');

// const firebaseConfig = {
//     apiKey: "AIzaSyClpUY1NfcCO_HEHPOi6ma9RXdsSxCGWy4",
//     authDomain: "ntou-auction-system-112eb.firebaseapp.com",
//     projectId: "ntou-auction-system-112eb",
//     storageBucket: "ntou-auction-system-112eb.appspot.com",
//     messagingSenderId: "320414610227",
//     appId: "1:320414610227:web:0ec7e2571126d3b2fd4446",
//     measurementId: "G-FLXQ2BQCZF"
// };

// // Initialize Firebase
// const firebase = initializeApp(firebaseConfig);
// const auth = getAuth();
// const db = getFirestore(firebase);

const admin = require("firebase-admin");
const { decryptTpString } = require("secure-file.js")
const secureFileName = "serviceAccount.json.secure";
const jsonStr = await decryptTpString(secureFileName);
const serviceAccount = JSON.parse(jsonStr);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ntou-auction-system-112eb.firebaseio.com'
});

const db = admin.firestore();
const productsRef = db.collection("products");
const usersRef = db.collection("users");
const queryRef = productsRef.where("type", "==", "bids");

let rule = new schedule.RecurrenceRule();
rule.second = [0, 10, 20, 30, 40, 50];
// scheduleJob: https://segmentfault.com/a/1190000022455361
schedule.scheduleJob(rule, async () => {
    queryRef.get()
    .then((querySnapshot) => {
        querySnapshot.forEach(async (productDoc) => {
            const productData = productDoc.data();
            if (productData.canBid == true) {
                console.log("Checking...");
                if (productData.bids_info.modtime) {
                    let endDate = productData.endtime.toDate();
                    let endDate1 = productData.bids_info.modtime.toDate();
                    endDate1.setHours(endDate.getHours() + 8);
                    if (endDate1 < endDate) {
                        endDate = endDate1;
                    }
                    let currentDate = new Date();
                    if (currentDate >= endDate) {
                        console.log("The bidding of product with id: " + productDoc.id + " has ended.");
                        const res1 = await usersRef.doc(productData.bids_info.who1).update({
                            ['cart.' + productDoc.id]: 1,
                            ['bids.' + productDoc.id]: admin.firestore.FieldValue.delete()
                        });
                        const res2 = await productsRef.doc(productDoc.id).update({
                            canBid: false
                        });
                    }
                }
                else {
                    let endDate = productData.endtime.toDate();
                    let currentDate = new Date();
                    if (currentDate >= endDate) {
                        console.log("The bidding of product with id: " + productDoc.id + " has ended.");
                        const res2 = await productsRef.doc(productDoc.id).update({
                            canBid: false
                        });
                    }
                }
            }
        });
    })
    .catch((error) => {
        console.error('Error getting documents: ', error);
    });
})

const app = express()
const PORT = process.env.PORT || 3000
let srv=app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(express.static('.'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/header/index.html');
})