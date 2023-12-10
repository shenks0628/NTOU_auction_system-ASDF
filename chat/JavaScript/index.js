// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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

async function getMyMessage() {
    const users = await getDoc(doc(db, "users", auth.currentUser.email));
    if (users.exists()) {
        Object.entries(users.data().message).forEach(async([key, value]) => {
            const docSnap = await getDoc(doc(db, "products", key));
            if (docSnap.exists()) {
                await setDoc(doc(db, "messages", key), { 
                    [encodeEmail()]: [{
                        content: `${docSnap.data().name.split('#')[0]}#${docSnap.data().price}#${value}`,
                        sendEmail: true,
                        time: Date.now(),
                        user: auth.currentUser.email
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
    const querySnapshot = await getDocs(query(collection(db, "messages")));
    mainElement.innerHTML = querySnapshot.empty ? '<h2>暫無任何通知<h2>' : ''; 
    querySnapshot.forEach(async(doc) => {
        if (doc.data()[encodeEmail()]) {
            const newA = document.createElement('a');
            newA.href = `chat.html?id=${doc.id}&email=${auth.currentUser.email}`;
            newA.className = 'chat';
            newA.innerHTML = await getProductHTML(doc.id) + getMsgHTML(doc.data()[encodeEmail()]);
            mainElement.appendChild(newA);
        }
    });
}

async function getProductHTML(id) {
    const products = await getDoc(doc(db, "products", id));
    return `<img src="${products.data().imgs[0]}"><div class="details"><h2>${products.data().name.split('#')[0]}</h2>`;
}
function getMsgHTML(msg) {
    let cnt = 0;
    let html = '';
    if (msg.length === 1) {
        if (msg[0].user == auth.currentUser.email)
            html = `<p>感謝您在我們的網站上下單。</p></div>`;
        else
            html = `<p>您有一個新的訂單需要處理。</p></div>`;
    } else html = `<p>${msg[msg.length-1].content}</p></div>`;
    for (let i = msg.length-1; i >= 0; i--) {
        if (msg[i].user == auth.currentUser.email)
            break;
        cnt++;
    }
    if (cnt > 0)
        html += `<div class="unread">${cnt}</div>`;
    return html;
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        getMyMessage();
    }
});