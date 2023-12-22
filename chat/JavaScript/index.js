// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyClpUY1NfcCO_HEHPOi6ma9RXdsSxCGWy4",
    authDomain: "ntou-auction-system-112eb.firebaseapp.com",
    projectId: "ntou-auction-system-112eb",
    storageBucket: "ntou-auction-system-112eb.appspot.com",
    messagingSenderId: "320414610227",
    appId: "1:320414610227:web:0ec7e2571126d3b2fd4446",
    measurementId: "G-FLXQ2BQCZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);

function encodeEmail(email = auth.currentUser.email) {
    return email.replace(/\./g, '_');
}
function decodeEmail(email) {
    return email.replace(/_/g, '.');
}

async function getMyMessage() {
    const users = await getDoc(doc(db, "users", auth.currentUser.email));
    if (users.exists()) {
        Object.entries(users.data().message).forEach(async([key, value]) => {
            const docSnap = await getDoc(doc(db, "products", key));
            if (docSnap.exists()) {
                await setDoc(doc(db, "messages", key), { 
                    [encodeEmail()]: [{
                        content: `${docSnap.data().name.split('#')[0]}#${docSnap.data().price}#${value}`,
                        isRecord: false,
                        sendEmail: true,
                        time: Date.now(),
                        user: 'system'
                    }]
                }, { merge: true });
            }
        });
        await updateDoc(doc(db, "users", auth.currentUser.email), {message: {}});
        getMessages();
    }
}

async function getMessages() {
    const mainElement = document.querySelector('main');
    mainElement.innerHTML = ''; 
    await getItemsIBought();
    await getMyProducts();
    if (mainElement.innerHTML === '') mainElement.innerHTML = '<h2>暫無任何通知<h2>';

    async function getItemsIBought() {
        const querySnapshot = await getDocs(query(collection(db, "messages")));
        querySnapshot.forEach(async(docSnap) => {
            if (docSnap.data()[encodeEmail()]) {
                const product = await getDoc(doc(db, "products", docSnap.id));
                createMsgToMain(product, auth.currentUser.email, docSnap.data()[encodeEmail()]);
            }
        });
    }
    async function getMyProducts() {
        const querySnapshot = await getDocs(query(collection(db, "products"), where("seller", "==", auth.currentUser.email)));
        await querySnapshot.forEach(async(docSnap) => {
            const messagesDoc = await getDoc(doc(db, "messages", docSnap.id));
            if (messagesDoc.exists()) {
                Object.entries(messagesDoc.data()).forEach(async([key, value]) => {
                    createMsgToMain(docSnap, decodeEmail(key), value);
                });
            }
        });
    }
    function createMsgToMain(product, email, msg) {
        const id = product.id, data = product.data();
        const newA = document.createElement('a');
        let cnt = 0
        let html = `<img src="${data.imgs[0]}"><div class="details"><h2>${data.name.split('#')[0]}</h2>`;
        if (msg.length === 1)
            html += `<p>商品編號: ${id}</p></div>`;
        else if (msg[msg.length-1].content.startsWith('<img src="'))
            html += `<p>圖片已傳送</p></div>`;
        else
            html += `<p>${msg[msg.length-1].content}</p></div>`;
        for (let i = msg.length-1; i >= 0; i--) {
            if (msg[i].user == auth.currentUser.email) break;
            cnt++;
        }
        if (cnt > 0) html += `<div class="unread">${cnt}</div>`;
        newA.href = `chat.html?id=${id}&email=${email}`;
        newA.className = 'chat';
        newA.innerHTML = html;
        mainElement.appendChild(newA);
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        getMyMessage();
    }
});