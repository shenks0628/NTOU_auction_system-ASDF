// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, getDocs, query, where, orderBy, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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

async function getMyMessage() {
    const users = await getDoc(doc(db, "users", auth.currentUser.email));
    if (users.exists()) {
        Object.entries(users.data().message).forEach(async([key, value]) => {
            await setDoc(doc(db, "messages", key), { 
                [auth.currentUser.email]: [{
                    content: value.toString(),
                    sendEmail: true,
                    time: Date.now(),
                    user: auth.currentUser.email
                }]
            }, { merge: true });
        });
        await updateDoc(doc(db, "users", auth.currentUser.email), {message: {}});
        getMessages();
    }
}
async function getMessages() {
    const mainElement = document.querySelector('main');
    mainElement.innerHTML = '';
    const querySnapshot = await getDocs(query(collection(db, "messages")));
    querySnapshot.forEach((doc) => {
        if (doc.data()[auth.currentUser.email]) {
            const msg = doc.data()[auth.currentUser.email];
            const newA = document.createElement('a');
            newA.href = `chat.html?id=${doc.id}&email=${auth.currentUser.email}`;
            newA.className = 'chat';
            newA.innerHTML = `
                <img src="https://pbs.twimg.com/profile_images/1604390688275464192/A5BL2Vtc_400x400.jpg" alt="User 1">
                <div class="details">
                    <h2>User 1</h2>
                    <p>最近一則訊息:你好嗎?</p>
                </div>
                <div class="unread">1</div>
            `;
            mainElement.appendChild(newA);
            if (msg.length === 1) {
                if (msg[0].user == auth.currentUser.email) {
                    console.log('感謝您在我們的網站上下單。以下是您的訂單詳情:')
                } else {
                    console.log('您有一個新的訂單需要處理。以下是訂單的詳細訊息:')
                }
            } else {
                console.log(msg.pop().content)
            }
        }
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        getMyMessage();
    } else {
        console.log("87")
    }
});