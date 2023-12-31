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

let productsdata={};
let userEmail;

const start = async() => {
    const header = document.getElementsByTagName("header")[0];
    const container = document.getElementsByClassName("pageContainer")[0];
    console.log(header,container);
    onAuthStateChanged(auth, async (user) =>{
        if (user) {
            userEmail = user.email;
            console.log(userEmail);
            const userRef = await getDoc(doc(db, "users", userEmail));
            const userInfo = userRef.data();
            productsdata = userInfo.sold;
            productsdata = Object.keys(productsdata).map(key => ({ id: key, number: productsdata[key]}));
            console.log(productsdata);
            await showall(productsdata);
            await showMost(productsdata);
            await showhigh(productsdata);
        }else { // 沒有登入
            console.log("沒拿到userid");
            //userInfo = undefined;
            header.innerHTML = "請先登入後再來查看";
            container.style.display = "none";
       }
    })

}

async function showMost(Mostdata){
    let most = Mostdata.sort((a, b) => b.number - a.number)[0];
    const mostProduct = document.getElementById("display_most");
    const mostDiv = document.createElement("div");
    console.log(most);

    let mostSnapshot = await getDoc(doc(db, "products", most.id));
    let mostprice = mostSnapshot.data().price;

    let mostImg = document.createElement("img");
    mostImg.src = mostSnapshot.data().imgs[0];
    mostImg.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            url = "../api/mobile.html?id="+ most.id;
        }
        else {
            url = "../product/index.html?id="+ most.id;
        }
        window.location.href = url;
    });
    mostProduct.appendChild(mostImg);

    let transactionCount = document.createElement("p");
    transactionCount.textContent = "交易量：" + most.number+" 件";
    transactionCount.style.fontSize = "30px";
    mostDiv.appendChild(transactionCount);

    let transactionPrice = document.createElement("p");
    transactionPrice.textContent = "商品總收入：" + most.number*mostprice+" 元";
    transactionPrice.style.fontSize = "30px";
    mostDiv.appendChild(transactionPrice);
    mostProduct.appendChild(mostDiv);
}

async function showall(alldata){
    const allProduct = document.getElementById("display_all");
    for (let i = 0; i < alldata.length; i++){
        let allSnapshot = await getDoc(doc(db, "products", alldata[i].id));
        const allDiv = document.createElement("div");
        let allImg = document.createElement("img");
        allImg.src = allSnapshot.data().imgs[0];
        allImg.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                url = "../api/mobile.html?id="+ alldata[i].id;
            }
            else {
                url = "../product/index.html?id="+ alldata[i].id;
            }
            window.location.href = url;
        });
        allDiv.appendChild(allImg);

        let transactionCount = document.createElement("p");
        transactionCount.textContent = "交易量：" + alldata[i].number+" 件";
        transactionCount.style.fontSize = "25px";
        allDiv.appendChild(transactionCount);

        let transactionPrice = document.createElement("p");
        transactionPrice.textContent = "商品總收入：" + alldata[i].number*allSnapshot.data().price+" 元";
        transactionPrice.style.fontSize = "25px";
        allDiv.appendChild(transactionPrice);
        allProduct.appendChild(allDiv);
    }
}

async function showhigh(highdata){
    const highProduct = document.getElementById("display_high");
    const highDiv = document.createElement("div");
    let high = 0;
    let finalSnapshot;
    let finalindex;
    console.log(high);
    for (let i = 0; i < highdata.length; i++){
        let highSnapshot = await getDoc(doc(db, "products", highdata[i].id));
        console.log(highSnapshot.data().price*highdata[i].number);
        if (highSnapshot.data().price*highdata[i].number > high){
            high = highSnapshot.data().price*highdata[i].number;
            finalSnapshot = highSnapshot;
            finalindex = i;
        }
    }
    console.log(highdata);
    let highImg = document.createElement("img");
    highImg.src = finalSnapshot.data().imgs[0];
    highImg.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            url = "../api/mobile.html?id="+ highdata[finalindex].id;
        }
        else {
            url = "../product/index.html?id="+ highdata[finalindex].id;
        }
        window.location.href = url;
    });
    highProduct.appendChild(highImg);

    let transactionCount = document.createElement("p");
    transactionCount.textContent = "交易量：" + highdata[finalindex].number+" 件";
    transactionCount.style.fontSize = "30px";
    highDiv.appendChild(transactionCount);

    let transactionPrice = document.createElement("p");
    transactionPrice.textContent = "商品總收入：" + high +" 元";
    transactionPrice.style.fontSize = "30px";
    highDiv.appendChild(transactionPrice);
    highProduct.appendChild(highDiv);
    
}
window.addEventListener("load", start);