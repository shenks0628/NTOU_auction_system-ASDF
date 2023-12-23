// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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

function add() {
    window.location.href = "../edit/index.html";
}

function edit(docId) {
    console.log(docId);
    const url = "../edit/index.html?id=" + docId;
    window.location.href = url;
}

async function del(docId) {
    console.log(docId);
    if (confirm('確定要刪除嗎？')) {
        await deleteDoc(doc(db, "products", docId));
        start();
    }
}

function shn() {
    let normal_display_list = document.getElementById("normal_display_list");
    if (normal_display_list.style.display == "") {
        normal_display_list.style.display = "none";
    }
    else if (normal_display_list.style.display == "none") {
        normal_display_list.style.display = "";
    }
    else {
        normal_display_list.style.display = "none";
    }
}

function shb() {
    let bids_display_list = document.getElementById("bids_display_list");
    if (bids_display_list.style.display == "") {
        bids_display_list.style.display = "none";
    }
    else if (bids_display_list.style.display == "none") {
        bids_display_list.style.display = "";
    }
    else {
        bids_display_list.style.display = "none";
    }
}

const handleCheck = (event) => {
    const targetId = event.target.id;
    console.log(targetId);
    // Check if the clicked element is an edit or delete button
    if (targetId.startsWith("edit")) {
        const productId = targetId.slice(4);
        edit(productId);
    }
    else if (targetId.startsWith("del")) {
        const productId = targetId.slice(3);
        del(productId);
    }
}

const start = async () => {
    const title = document.getElementById("title");
    const normal_title = document.getElementById("normal_title");
    const bids_title = document.getElementById("bids_title");
    const show_hide_normal = document.getElementById("show_hide_normal");
    const show_hide_bids = document.getElementById("show_hide_bids");
    const add_btn = document.getElementById("add");
    let url;
    if (window.innerWidth <= 970) {
        url = "../api/mobile.html?id=";
    }
    else {
        url = "../product/index.html?id=";
    }
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            title.innerHTML = "賣場清單";
            normal_title.style.display = "";
            bids_title.style.display = "";
            show_hide_normal.style.display = "";
            show_hide_bids.style.display = "";
            add_btn.style.display = "";
            const userId = user.email;

            const q = query(collection(db, "products"), where("seller", "==", userId));

            let normal_display_list = document.getElementById("normal_display_list");
            let bids_display_list = document.getElementById("bids_display_list");
            normal_display_list.innerHTML = "";
            bids_display_list.innerHTML = "";
            console.log(normal_display_list.innerHTML);
            console.log(bids_display_list.innerHTML);
            const querySnapshot = await getDocs(q);
            console.log(querySnapshot);
            querySnapshot.forEach((doc) => {
                console.log(doc.id, "=>", doc.data());
                const productData = doc.data();
                const productName = productData.name.split('#')[0];
                if (productData.type == "normal") {
                    normal_display_list.innerHTML += '<div class="product" id="' + doc.id + '"><a href="' + url + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>剩餘件數：<a class="price">' + productData.quantity + '</a></p><p>不二價：<a class="price">$' + productData.price + '</a></p><p><button class="btn" type="submit" id="edit' + doc.id + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + doc.id + '">刪除商品</button></p>';
                }
                else if (productData.type == "bids") {
                    let endDate = productData.endtime.toDate();
                    if (productData.bids_info.modtime) {
                        const tmpDate = productData.bids_info.modtime.toDate();
                        tmpDate.setHours(tmpDate.getHours() + 8);
                        if (tmpDate < endDate) {
                            endDate = tmpDate;
                        }
                    }
                    bids_display_list.innerHTML += '<div class="product" id="' + doc.id + '"><a href="' + url + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：<a class="price">$' + productData.price + '</a></p><p><button class="btn" type="submit" id="edit' + doc.id + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + doc.id + '">刪除商品</button></p>';
                }
            });
            normal_display_list.removeEventListener("click", handleCheck);
            normal_display_list.addEventListener("click", handleCheck);
            bids_display_list.removeEventListener("click", handleCheck);
            bids_display_list.addEventListener("click", handleCheck);
            show_hide_normal.removeEventListener("click", shn);
            show_hide_normal.addEventListener("click", shn);
            show_hide_bids.removeEventListener("click", shb);
            show_hide_bids.addEventListener("click", shb);
            add_btn.removeEventListener("click", add);
            add_btn.addEventListener("click", add);
        }
        else {
            title.innerHTML = "請先登入後再來查看";
            normal_title.style.display = "none";
            bids_title.style.display = "none";
            show_hide_normal.style.display = "none";
            show_hide_bids.style.display = "none";
            add_btn.style.display = "none";
        }
    });
    const user = auth.currentUser;
    console.log(user);
};

window.addEventListener("load", start);
