// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, onSnapshot, updateDoc, increment, arrayUnion, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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

const urlParams = new URLSearchParams(window.location.search);
const buyer = urlParams.get('email');
const productID = urlParams.get('id');
const buyerRef = doc(db, "users", buyer);
const messagesRef = doc(db, "messages", productID);
const encodeBuyer = encodeEmail(buyer);

onAuthStateChanged(auth, (user) => {
    if (user) {
        verifyIdentity(user.email);
    }
});

function encodeEmail(email) {
    return email.replace(/\./g, '_');
}
function formatDateTime(time) {
    const date = new Date(time);
    const now = new Date();
    if (date.getDate() === now.getDate())
        return `今天 ${formatTime(date)}`;
    else if (date.getDate() === now.getDate()-1)
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
async function verifyIdentity(email) {
    const mainElement = document.querySelector('main');
    const docSnap = await getDoc(doc(db, "products", productID));
    if (docSnap.exists() && (email == buyer || email == docSnap.data().seller)) {
        mainElement.innerHTML = '';
        let msgCnt = 0;
        const unsub = onSnapshot(messagesRef, (doc) => {
            if (doc.data()[encodeBuyer])
                for (; msgCnt < doc.data()[encodeBuyer].length; msgCnt++)
                    createMsgToMain(doc.data()[encodeBuyer][msgCnt], email);
        });
    }

    function createMsgToMain(msg, email) {
        if (msg.user === 'system') {
            if (msg.content.split('#').length === 3) {
                const name = msg.content.split('#')[0];
                const price = parseInt(msg.content.split('#')[1]);
                const quantity = parseInt(msg.content.split('#')[2]);
                headerText.innerHTML = name;
                headerText.href = `../api/?id=${productID}`;
                msg.content = `
                    商品編號: ${productID}<br>
                    商品名稱: ${name}<br>
                    購買數量: ${quantity}<br>
                    訂單總額: ${price*quantity}<br>
                    下單日期: ${formatDateTime(msg.time)}<br><br>
                `;
                if (!msg.isRecord) {
                    msg.content += email == buyer ? '<button id="cancelOrderBtn">取消訂單</button>' : '<button id="confirmOrderBtn">確認訂單</button>';
                    const newDiv = document.createElement('div');
                    newDiv.className = 'chat-item system';
                    newDiv.innerHTML = `<span class="message">${msg.content}</span>`;
                    mainElement.appendChild(newDiv);
                    document.getElementById('cancelOrderBtn')?.addEventListener('click', () => {
                        if (!isWithinDays(1, msg.time))
                            alert('已超過取消時間，無法取消訂單!');
                        else if (confirm('確定要取消訂單嗎?'))
                            cancelOrder();
                    });
                    document.getElementById('confirmOrderBtn')?.addEventListener('click', () => {
                        if (isWithinDays(1, msg.time))
                            alert('賣家需要等待一天後才能確認訂單!');
                        else if (confirm('確定要確認訂單嗎?'))
                            confirmOrder(quantity);
                    });
                } else {
                    msg.content += '<button disabled>訂單已成立</button>'
                    const newDiv = document.createElement('div');
                    newDiv.className = 'chat-item system';
                    newDiv.innerHTML = `<span class="message">${msg.content}</span>`;
                    mainElement.appendChild(newDiv);
                }
            } else {
                headerText.innerHTML += ' (已成立)';
                msg.content = '賣家成立訂單'
                const newDiv = document.createElement('div');
                newDiv.className = 'chat-item system-small';
                newDiv.innerHTML = `<span class="message">${msg.content}</span>`;
                mainElement.appendChild(newDiv);
            }
        } else {
            const newDiv = document.createElement('div');
            newDiv.className = `chat-item ${msg.user == email ? 'right' : 'left'}`;
            newDiv.innerHTML = `
                <span class="message">${msg.content}</span>
                <span class="time">${formatDateTime(msg.time)}</span>
            `;
            mainElement.appendChild(newDiv);
        }
    }
}
async function cancelOrder() {
    await deleteDoc(messagesRef);
    window.location.href = 'index.html';
}
async function confirmOrder(quantity) {
    const buyerDoc = await getDoc(buyerRef);
    const messagesDoc = await getDoc(messagesRef);
    const messages = messagesDoc.data()[encodeBuyer];
    messages[0].isRecord = true;
    messages.push({
        content: '訂單已確認',
        sendEmail: true,
        time: Date.now(),
        user: 'system'
    });
    if (buyerDoc.exists() && buyerDoc.data().record[productID])
        await updateDoc(buyerRef, { [`record.${productID}.quantity`]: increment(quantity) });
    else
        await updateDoc(buyerRef, { [`record.${productID}`]: {isRate: false, quantity: quantity} });
    await updateDoc(messagesRef, { [encodeBuyer]: messages });
    window.location.href = window.location.href;
}
async function uploadMessage() {
    try {
        await updateDoc(messagesRef, {
            [encodeBuyer]: arrayUnion({
                content: textInput.value,
                sendEmail: false,
                time: Date.now(),
                user: auth.currentUser.email
            })
        });
        textInput.value = '';
    } catch (e) { window.location.href = window.location.href; }
}

sendBtn.onclick = function (e) {
    uploadMessage();
}
fileInput.onchange = function (e) {

}

function Keydown(e) {
    if(e.keyCode == 13) uploadMessage();
}
document.addEventListener('keydown', Keydown, false);
//自動下拉、上傳檔案