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

function edit(docId) {
    console.log(docId);
}

async function del(docId) {
    console.log(docId);
    if (confirm('確定要刪除嗎')) {
        await deleteDoc(doc(db, "products", docId));
        display();
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

const display = async () => {
    const prev_view_title = document.getElementById("prev_view_title");
    const latest_normal = document.getElementById("latest_normal");
    const latest_bids = document.getElementById("latest_bids");
    const prev_view = document.getElementById("prev_view");
    latest_normal.innerHTML = "";
    latest_bids.innerHTML = "";
    prev_view.innerHTML = "";
    let userId;
    onAuthStateChanged(auth, async(user) => {
        if (user) {
            prev_view_title.innerHTML = "您最近瀏覽的商品";
            userId = user.email;
            const docSnap = await getDoc(doc(db, "users", userId));
            if (docSnap.exists()) {
                const views = docSnap.data().view;
                views.forEach(async (productId) => {
                    console.log(productId);
                    const productDoc = await getDoc(doc(db, "products", productId));
                    const productData = productDoc.data();
                    const productName = productData.name.split('#')[0];
                    const productType = productData.type;
                    const seller = productData.seller;
                    if (userId == seller) {
                        if (productType == "normal") {
                            prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="api/index.html?id=' + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><p><button class="btn" type="submit" id="edit' + productId + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + productId + '">刪除商品</button></p></div>';
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
                            prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="api/index.html?id=' + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><p><button class="btn" type="submit" id="edit' + productId + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + productId + '">刪除商品</button></p></div>';
                        }
                    }
                    else {
                        if (productType == "normal") {
                            prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="api/index.html?id=' + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><button class="btn">加入購物車</button></div>';
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
                    }
                    prev_view.removeEventListener("click", handleCheck);
                    prev_view.addEventListener("click", handleCheck);
                });
            }
        }
        else {
            prev_view_title.innerHTML = "";
        }
    });
    const q_noraml = query(collection(db, "products"), where("type", "==", "normal"), orderBy("time", "desc"), limit(20));
    const q_bids = query(collection(db, "products"), where("type", "==", "bids"), orderBy("time", "desc"), limit(20));
    const queryNormalSnapshot = await getDocs(q_noraml);
    const queryBidsSnapshot = await getDocs(q_bids);
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
    latest_normal.removeEventListener("click", handleCheck);
    latest_normal.addEventListener("click", handleCheck);
    latest_bids.removeEventListener("click", handleCheck);
    latest_bids.addEventListener("click", handleCheck);
}

window.addEventListener("load", display);