const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.get('id');
const buyer = urlParams.get('email');


// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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
const messagesRef = doc(db, "messages", productID);

function encodeEmail(email = auth.currentUser.email) {
    return email.replace(/\./g, '_');
}
function formatDateTime(time) {
    const date = new Date(time);
    if (isWithinDays(1, time))
        return `今天 ${formatTime(date)}`;
    else if (isWithinDays(2, time))
        return `昨天 ${formatTime(date)}`;
    else
        return `${date.getMonth() + 1}/${date.getDate()} ${formatTime(date)}`;
}
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
function isWithinDays(days, time) {
    return Date.now()-time < 86400000*days;
}
function getMsgDiv(msg, email) {
    const newDiv = document.createElement('div');
    newDiv.className = `chat-item item-${msg.user == email ? 'right' : 'left'}`;
    newDiv.innerHTML = `
        <span class="message">${msg.content}</span>
        <span class="time">${formatDateTime(msg.time)}</span>
    `;
    return newDiv;
}
async function verifyIdentity(email) {
    const docSnap = await getDoc(doc(db, "products", productID));
    if (docSnap.exists() && (email == buyer || email == docSnap.data().seller)) {
        const mainElement = document.querySelector('main');
        mainElement.innerHTML = '';
        let msgCnt = 0;
        const unsub = onSnapshot(messagesRef, (doc) => {
            if (doc.data()[encodeEmail(buyer)]) {
                const messages = doc.data()[encodeEmail(buyer)];
                for (; msgCnt < messages.length; msgCnt++) {
                    const msg = messages[msgCnt];
                    if (msgCnt == 0) {
                        const name = msg.content.split('#')[0];
                        const price = parseInt(msg.content.split('#')[1]);
                        const quantity = parseInt(msg.content.split('#')[2]);
                        headerText.innerHTML = name;
                        headerText.href = `../api/?id=${productID}`;
                        if (email == buyer) {
                            msg.content = `
                                感謝您在我們的網站上下單。<br><br>
                                商品編號: ${productID}<br>
                                商品名稱: ${name}<br>
                                購買數量: ${quantity}<br>
                                訂單總額: ${price*quantity}<br>
                                下單日期: ${formatDateTime(msg.time)}<br><br>
                                <button>取消訂單</button>
                            `;
                        } else {
                            msg.content = `
                                您有一個新的訂單需要處理。<br><br>
                                商品編號: ${productID}<br>
                                商品名稱: ${name}<br>
                                購買數量: ${quantity}<br>
                                訂單總額: ${price*quantity}<br>
                                下單日期: ${formatDateTime(msg.time)}<br><br>
                                <button>確認訂單</button>
                            `;
                        }
                    }
                    mainElement.appendChild(getMsgDiv(msg, email));
                }
            }
        });
    }
}

async function uploadMessage() {
    await updateDoc(messagesRef, {
        [encodeEmail()]: arrayUnion({
            content: textInput.value,
            sendEmail: false,
            time: Date.now(),
            user: auth.currentUser.email
        })
    });
    textInput.value = '';
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        verifyIdentity(user.email);
    }
});

sendBtn.onclick = function (e) {
    uploadMessage();
}
fileInput.onchange = function (e) {

}
//自動下拉、上傳檔案、一天內確認/取消