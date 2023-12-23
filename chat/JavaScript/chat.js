// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, onSnapshot, updateDoc, increment, arrayUnion, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable , getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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
const mainElement = document.querySelector('main');

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
                            cancelOrder(quantity);
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
        scrollDownBtn.className = isScrolledToBottom() ? '' : 'display';
    }
}
async function cancelOrder(quantity) {
    await deleteDoc(messagesRef);
    await updateDoc(doc(db, "products", productID), { quantity: increment(quantity) });
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
        quantity += buyerDoc.data().record[productID].quantity;
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
function isScrolledToBottom() {
    return mainElement.scrollTop + mainElement.clientHeight >= mainElement.scrollHeight - 1;
}
mainElement.addEventListener('scroll', function () {
    scrollUpBtn.className = mainElement.scrollTop>1 ? 'display' : '';
    scrollDownBtn.className = isScrolledToBottom() ? '' : 'display';
});
scrollUpBtn.onclick = function (e) {
    mainElement.scrollTop = 0;
}
scrollDownBtn.onclick = function (e) {
    mainElement.scrollTop = mainElement.scrollHeight;
}
sendBtn.onclick = function (e) {
    uploadMessage();
}
fileInput.onchange = function (e) {
    uploadFile();
}

function Keydown(e) {
    if(e.keyCode == 13) uploadMessage();
}
document.addEventListener('keydown', Keydown, false);
//自動下拉、上傳檔案

async function uploadFile() {
    if (fileInput.files[0]) {
        const file = fileInput.files[0];
        if (!file.type.includes("image/")) {
            alert("Please select an image file.");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert('File size exceeds 20MB. Please choose a smaller file.');
            return;
        }
        textInput.disabled = true;
        const storage = getStorage();
        const filename = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const storageRef = ref(storage, 'files/' + filename);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on('state_changed', (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            textInput.value = 'Upload is ' + progress + '% done';
        }, (error) => {
            // Handle unsuccessful uploads
            alert('上傳失敗');
            textInput.value = '';
            textInput.disabled = false;
        }, () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL) => {
                //console.log('File available at', downloadURL);
                textInput.value = '<img src="' + downloadURL + '">';
                await uploadMessage();
                textInput.disabled = false;
            });
        });
    }
}