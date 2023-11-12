import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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

let bidsData;

const start1 = () => {
    console.log(bidsData);
    let display_list = document.getElementById("display_list");
    display_list.innerHTML = "";
    for (let i = 0; i < bidsData.length; i++) {
        const productId = bidsData[i]; // 替換成實際的產品 ID
        console.log(productId);
        // 使用 doc 函數構建該產品的參考路徑
        const productRef = doc(db, "products", productId);

        // 使用 getDoc 函數取得該產品的文件快照
        getDoc(productRef)
        .then((productDoc) => {
            if (productDoc.exists()) {
                // 取得該產品的資料
                const productData = productDoc.data();
                display_list.innerHTML += '<div class="product"><img src="' + productData.imgs[0] + '" alt="product"><h3>' + productData.name + 
                                            '</h3><p>實時競價：</p><p class="price">' + productData.price + '</p>';
                console.log("Product data for product with ID", productId, ":", productData);
            }
            else {
            console.log("Product with ID", productId, "does not exist.");
            }
        })
        .catch((error) => {
            console.error("Error getting product document:", error);
        });
    }
};

const start = () => {
    const user = auth.currentUser;
    if (true) {
        // const userId = "ethan147852369@gmail.com";
        const userId = user.email;

    // 使用 doc 函數構建該使用者的參考路徑
        const userRef = doc(db, "users", userId);

    // 使用 getDoc 函數取得該使用者的文件快照
        getDoc(userRef)
        .then((userDoc) => {
            if (userDoc.exists()) {
                // 取得該使用者的資料
                const userData = userDoc.data();

                // 確認該使用者是否有 cart 資料
                if (userData && userData.bids) {
                    bidsData = userData.bids;
                    console.log("Bids data for user with ID", userId, ":", bidsData);
                }
                else {
                    console.log("User with ID", userId, "does not have bids data.");
                }
            }
            else {
                console.log("User with ID", userId, "does not exist.");
            }
            start1();
        })
        .catch((error) => {
            console.error("Error getting user document:", error);
        });
    }
};

window.addEventListener("load", start);