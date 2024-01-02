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
const nodemailer = require('nodemailer');
const { decryptToString } = require("./src/secure-file.js");
const { initializeApp } = require('firebase-admin/app');
const secureFileName = "serviceAccount.json.secure";

let db, productsRef, usersRef, queryRef;

const initializeFirebase = async () => {
    const jsonStr = await decryptToString(secureFileName);
    const serviceAccount = JSON.parse(jsonStr);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://ntou-auction-system-112eb.firebaseio.com'
    });
    db = admin.firestore();
    productsRef = db.collection("products");
    usersRef = db.collection("users");
    queryRef = productsRef.where("type", "==", "bids");
};

initializeFirebase();

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
                    endDate1.setHours(endDate1.getHours() + 8);
                    if (endDate1 < endDate) {
                        endDate = endDate1;
                    }
                    let currentDate = new Date();
                    if (currentDate >= endDate) {
                        console.log("The bidding of product with id: " + productDoc.id + " has ended.");
                        console.log(productData.bids_info.who1 + " has won the bid.");
                        const sellerTitle = 'NTOU-ASDF 您的競標商品「' + productData.name.split('#')[0] + '」已結標';
                        const sellerText = `尊敬的賣家，您的競標商品「${productData.name.split('#')[0]}」已結標，由買家${productData.bids_info.who1}拍到且最終競價為$${productData.price}。\n\n如有任何疑問或需要協助，請隨時聯絡我們的客戶服務團隊。\n\n謝謝！\nNTOU-ASDF`;
                        sendEmail(productData.seller, sellerTitle, sellerText);
                        const customerTitle = 'NTOU-ASDF 恭喜您注得商品「' + productData.name.split('#')[0] + '」';
                        const customerText = `尊敬的買家，感謝您在我們的網站上參與競標。我們很高興告訴您，您成功以$${productData.price}贏得商品「${productData.name.split('#')[0]}」。歡迎您至購物車對此商品下訂單，以下是購物車連結：\nhttps://ntou-asdf.onrender.com/header/?path=cart/cart.html\n\n如有任何疑問或需要協助，請隨時聯絡我們的客戶服務團隊。\n\n謝謝！\nNTOU-ASDF`;
                        sendEmail(productData.bids_info.who1, customerTitle, customerText);
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
                        const sellerTitle = 'NTOU-ASDF 您的競標商品「' + productData.name.split('#')[0] + '」未拍出';
                        const sellerText = `尊敬的賣家，您的競標商品「${productData.name.split('#')[0]}」並未被拍出，故此商品已被自動下架。\n\n如有任何疑問，請隨時聯絡我們的客戶服務團隊。\n\n謝謝！\nNTOU-ASDF`;
                        sendEmail(productData.seller, sellerTitle, sellerText);
                        console.log("The bidding of product with id: " + productDoc.id + " has ended.");
                        const res2 = await productsRef.doc(productDoc.id).delete();
                    }
                }
            }
        });
        function sendEmail(to, title, text) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ethan147852369@gmail.com',
                    pass: 'alwm ivni bgev nhcs'
                }
            });
            var mailOptions = {
                from: 'ntouasdf@gmail.com',
                to: to,
                subject: title,
                text: text
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    })
    .catch((error) => {
        console.error('Error getting documents: ', error);
    });

    
    //send email
    const messagesRef = db.collection("messages");
    messagesRef.get().then((querySnapshot) => {
        querySnapshot.forEach(async (messageDoc) => {
            const messages = messageDoc.data();
            for (let key in messages) {
                const doc = await db.collection('products').doc(messageDoc.id).get();
                if (doc.exists) {
                    console.log('Product seller:', doc.data().seller);
                    for (let value in messages[key]) {
                        const msg = messages[key][value];
                        if (msg.sendEmail) {
                            if (msg.content === '訂單已確認') {
                                const title = 'NTOU-ASDF 您有一個訂單被確認';
                                const text = `尊敬的買家，感謝您在我們的網站上下訂單。我們很高興告訴您，您的訂單已得到確認。以下是訂單的通知連結：\nhttps://ntou-asdf.onrender.com/header/?path=chat/chat.html?id=${messageDoc.id}&email=${decodeEmail(key)}\n\n如有任何疑問或需要協助，請隨時聯絡我們的客戶服務團隊。\n\n謝謝！\nNTOU-ASDF`;
                                sendEmail(decodeEmail(key), title, text);
                            } else {
                                const title = 'NTOU-ASDF 您有一個新的訂單需要處理';
                                const text = `尊敬的賣家，您有一個新的訂單需要處理。以下是訂單的通知連結：\nhttps://ntou-asdf.onrender.com/header/?path=chat/chat.html?id=${messageDoc.id}&email=${decodeEmail(key)}\n\n請盡快處理訂單，並透過系統更新訂單狀態。如有任何疑問或需要協助，請隨時聯絡我們的客戶服務團隊。\n\n謝謝！\nNTOU-ASDF`;
                                sendEmail(doc.data().seller, title, text);
                            }
                            messages[key][value].sendEmail = false;
                            const res = await messagesRef.doc(messageDoc.id).update({
                                [key]: messages[key]
                            });
                        }
                    }
                }
            }
        });
        function decodeEmail(email) {
            return email.replace(/_/g, '.');
        }
        function sendEmail(to, title, text) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ethan147852369@gmail.com',
                    pass: 'alwm ivni bgev nhcs'
                }
            });
            var mailOptions = {
                from: 'ntouasdf@gmail.com',
                to: to,
                subject: title,
                text: text
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
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