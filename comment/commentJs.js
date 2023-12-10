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


var user = await getDoc(doc(db, "users","liyuesa0616@gmail.com"));
var userInfo = user.data();
var avarta = document.getElementById("avartar");
var imgAvarta = document.createElement("img");
imgAvarta.src = userInfo.imgSrc;
avarta.appendChild(imgAvarta);
const start = () => {
    const title = document.getElementById("title");
    const comment = document.querySelector("main");
    //onAuthStateChanged(auth, async (user) =>{
        //if (user) {

            var userName = userInfo.name;
            console.log("user",userInfo);
            console.log('userName',userName);
            console.log('userAvarta',avarta);
            document.getElementById("submitBtn").addEventListener("click", add1);

        //}else { // 沒有登入
            //console.log("沒拿到userid");
            //userInfo = undefined;
           // title.innerHTML = "請先登入後再來查看";
            //comment.style.display = "none";
       // }
    //})
    
};
const addcomment = () => {

};

window.addEventListener("load", start);