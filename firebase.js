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

const display = async () => {
    const latest_normal = document.getElementById("latest_normal");
    const latest_bids = document.getElementById("latest_bids");
    const prev_view = document.getElementById("prev_view");
    const q_noraml = query(collection(db, "products"), where("type", "==", "normal"), orderBy("time", "desc"), limit(20));
    const q_bids = query(collection(db, "products"), where("type", "==", "bids"), orderBy("time", "desc"), limit(20));
    const queryNormalSnapshot = await getDocs(q_noraml);
    const queryBidsSnapshot = await getDocs(q_bids);
    latest_normal.innerHTML = "";
    latest_bids.innerHTML = "";
    prev_view.innerHTML = "";
    queryNormalSnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        const productData = doc.data();
        const productName = productData.name.split('#')[0];
        latest_normal.innerHTML += '<div class="product" id="' + doc.id + '"><a href="api/index.html?id=' + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><button class="btn">加入購物車</button></div>';
    });
    queryBidsSnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        const productData = doc.data();
        const productName = productData.name.split('#')[0];
        let endDate = productData.endtime.toDate();
        if (productData.bids_info.modtime) {
            const tmpDate = productData.bids_info.modtime.toDate();
            tmpDate.setHours(tmpDate.getHours() + 8);
            if (tmpDate < endDate) {
                endDate = tmpDate;
            }
        }
        latest_bids.innerHTML += '<div class="product" id="' + doc.id + '"><a href="api/index.html?id=' + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><button class="btn">加入競標清單</button></div>';
    });
    onAuthStateChanged(auth, async(user) => {
        if (user) {
            const userId = user.email;
            const docSnap = await getDoc(doc(db, "users", userId));
            if (docSnap.exists()) {
                const views = docSnap.data().view;
                views.forEach(async (productId) => {
                    const productData = await getDoc(doc(db, "products", productId));
                    const productName = productData.name.split('#')[0];
                    const productType = productData.type;
                    if (productType == "normal") {
                        prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="api/index.html?id=' + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><button class="btn">加入購物車</button></div>';;
                    }
                    else if (productType == "bids") {
                        let endDate = productData.endtime.toDate();
                        if (productData.bids_info.modtime) {
                            const tmpDate = productData.bids_info.modtime.toDate();
                            tmpDate.setHours(tmpDate.getHours() + 8);
                            if (tmpDate < endDate) {
                                endDate = tmpDate;
                            }
                        }
                        prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="api/index.html?id=' + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><button class="btn">加入競標清單</button></div>';
                    }
                });
            }
        }
        else {

        }
    });
}

window.addEventListener("load", display);