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

var userInfo;
var avarta;
var userName = "none";


const start = () => {
    const title = document.getElementById("title");
    const comment = document.querySelector("main");
    const stars = document.querySelectorAll(".star");
    stars.forEach(star => {
        star.addEventListener("click", handleRating);
    });
    onAuthStateChanged(auth, async (user) =>{
        if (user) {
            userInfo = user;
            userName = user.name;
            avarta = user.Imgsrc;
            console.log("userName", userName);
            console.log("avarta", avarta);
            document.getElementById("submitBtn").addEventListener("click", add1);

        }else { // 沒有登入
            console.log("沒拿到userid");
            userInfo = undefined;
            title.innerHTML = "請先登入後再來查看";
            comment.style.display = "none";
        }
    })
    
};
const addcomment = () => {

};

function handleRating(event) {
    if (event.target.classList.contains('star')) {
        const value = event.target.getAttribute('data-value');
        resetRating();
        highlightStars(value);
    }
}
function resetRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('active'));
}
function highlightStars(value) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < value) {
        star.classList.add('active');
        }
    });
}

function submitRating() {
    const comment = document.getElementById('commentInput').value;
    alert(`You rated it ${selectedRating} stars. Comment: ${comment}`);
    // 这里你可以将评分和评论发送到服务器，保存在数据库中，或者执行其他操作
}


getCurrentTime = function () {
    return new Date().toLocaleString();
};
window.addEventListener("load", start);