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




const start = () => {
    document.getElementById("submit_button").addEventListener("click", add1);
};
const add1 = () => {
    try {
        let in_name = document.getElementById("commentator").value;
        let in_rate = document.getElementsByClassName("star active").length;
        let in_content = document.getElementById("comment_space").value;
        
        console.log("in_name:", in_name);  // 在這裡添加這一行
        console.log("in_content:", in_content);  // 在這裡添加這一行
        console.log("in_rate:",in_rate);

        setDoc(doc(db, "comment_test", "comment"), {
            name: in_name,
            rate: in_rate,
            content: in_content,

        });
    } catch (err) {
        console.error("error", err);
    }
};
window.addEventListener("load", start);