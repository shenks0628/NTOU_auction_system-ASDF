import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, doc, setDoc, getDoc, getDocs,updateDoc ,query, orderBy, limit, where, onSnapshot, deleteDoc,deleteField} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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

let productsdata;
let userEmail;

const start = () => {
    onAuthStateChanged(auth, async (user) =>{
        if (user) {
            userEmail = user.email;
            console.log(userEmail);
            const userRef = await getDoc(doc(db, "users", userEmail));
            const userInfo = userRef.data();
            productsdata = userInfo.sold;
            console.log(productsdata);
            showMost(productsdata);
        }else { // 沒有登入
            console.log("沒拿到userid");
            userInfo = undefined;
           title.innerHTML = "請先登入後再來查看";
            comment.style.display = "none";
       }
    })

}

function showMost(data){
    const most = data.sort((a, b) => b - a).slice(0, 5);
    console.log(most);
    for (let i = 0; i < most.length; i++) {
        console.log(most[i]);
        const item = document.getElementById("item" + i);
        item.innerHTML = most[i];
    }
}
window.addEventListener("load", start);