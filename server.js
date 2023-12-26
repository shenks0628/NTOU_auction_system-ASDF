const express = require('express');
const morgan = require('morgan');   // logger
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const { response } = require('express');
const schedule = require('node-schedule');

// Import Firebase
const { initializeApp } = require('firebase-admin/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } = require('firebase/auth');
const { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField } = require('firebase/firestore');

// const firebaseConfig = {
//     apiKey: "AIzaSyClpUY1NfcCO_HEHPOi6ma9RXdsSxCGWy4",
//     authDomain: "ntou-auction-system-112eb.firebaseapp.com",
//     projectId: "ntou-auction-system-112eb",
//     storageBucket: "ntou-auction-system-112eb.appspot.com",
//     messagingSenderId: "320414610227",
//     appId: "1:320414610227:web:0ec7e2571126d3b2fd4446",
//     measurementId: "G-FLXQ2BQCZF"
// };

var admin = require("firebase-admin");

var serviceAccount = require("ntou-auction-system-112eb-firebase-adminsdk-rkjlt-a386ef742c.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://ntou-auction-system-112eb.firebaseio.com'
});

const db = admin.firestore();

schedule.scheduleJob('1 * * * * *', async () => {
    const q = query(collection(db, "products"), where("type", "==", "bids"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (productDoc) => {
        const productData = productDoc.data();
        if (productData.canBid == true) {
            if (productData.bids_info.modtime) {
                let endDate = productData.endtime.toDate();
                let endDate1 = productData.bids_info.modtime.toDate();
                endDate1.setHours(endDate.getHours() + 8);
                if (endDate1 < endDate) {
                    endDate = endDate1;
                }
                let currentDate = new Date();
                if (currentDate >= endDate) {
                    await updateDoc(doc(db, "users", productData.bids_info.who1), {
                        ['cart.' + productDoc.id]: 1,
                        ['bids.' + productDoc.id]: deleteField()
                    });
                    await updateDoc(doc(db, "products", productDoc.id), {
                        canBid: false
                    });
                }
            }
            else {
                let endDate = productData.endtime.toDate();
                let currentDate = new Date();
                if (currentDate >= endDate) {
                    await updateDoc(doc(db, "products", productDoc.id), {
                        canBid: false
                    });
                }
            }
        }
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