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
    window.location.href = "insert.html";
}

function edit(docId) {
    console.log(docId);
}

async function del(docId) {
    console.log(docId);
    await deleteDoc(doc(db, "products", docId));
    start();
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
    const login = document.getElementById("login");
    const title = document.getElementById("title");
    const add_btn = document.getElementById("add");
    // onAuthStateChanged(auth, async (user) => {
    //     if (user) {
    //         login.innerHTML = "登出";
    //         title.innerHTML = "賣場清單";
    //         add_btn.style.display = "block";
    //         add_btn.removeEventListener("click", add);
    //         add_btn.addEventListener("click", add);
    //         const userId = user.email;

    //         const q = query(collection(db, "products"), where("seller", "==", userId));

    //         let display_list = document.getElementById("display_list");
    //         display_list.innerHTML = "";
    //         console.log(display_list.innerHTML);
    //         const querySnapshot = await getDocs(q);
    //         console.log(querySnapshot);
    //         querySnapshot.forEach((doc) => {
    //             console.log(doc.id, "=>", doc.data());
    //             const productData = doc.data();
    //             display_list.innerHTML += '<div class="product" id="' + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"><h3>' + productData.name +  '</h3><p><button type="submit" id="edit' + doc.id + '">編輯商品</button></p><p><button type="submit" id="del' + doc.id + '">刪除商品</button></p>';
    //         });
    //         display_list.removeEventListener("click", handleCheck);
    //         display_list.addEventListener("click", handleCheck);
    //     }
    //     else {
    //         login.innerHTML = "登入";
    //         title.innerHTML = "請先登入後再來查看";
    //         add_btn.style.display = "none";
    //     }
    // });
    // const user = auth.currentUser;
    // console.log(user);
    const userId = "01057115@email.ntou.edu.tw";

    const q = query(collection(db, "products"), where("seller", "==", userId));

    const display_list = document.getElementById("display_list");
    display_list.innerHTML = "";
    console.log(display_list.innerHTML);
    const querySnapshot = await getDocs(q);
    console.log(querySnapshot);
    querySnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        const productData = doc.data();
        display_list.innerHTML += '<div class="product" id="' + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"><h3>' + productData.name +  '</h3><p><button class="btn" type="submit" id="edit' + doc.id + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + doc.id + '">刪除商品</button></p>';
    });
    display_list.removeEventListener("click", handleCheck);
    display_list.addEventListener("click", handleCheck);
    add_btn.removeEventListener("click", add);
    add_btn.addEventListener("click", add);
};

window.addEventListener("load", start);