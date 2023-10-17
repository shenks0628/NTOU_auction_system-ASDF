// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
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

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const start = () => {
    document.getElementById("insert").addEventListener("click", insert);
};

const insert = async () => {
    try {
        console.log("abc");
        let imgSrc = document.getElementById("imgSrc").value;
        let imgs0 = document.getElementById("imgs0").value;
        let imgs1 = document.getElementById("imgs1").value;
        let imgs2 = document.getElementById("imgs2").value;
        let imgs3 = document.getElementById("imgs3").value;
        let imgs4 = document.getElementById("imgs4").value;
        let name = document.getElementById("name").value;
        let price = document.getElementById("price").value;
        let seller_email = document.getElementById("seller_email").value;
        let seller_imgSrc = document.getElementById("seller_imgSrc").value;
        let { id } = await addDoc(collection(db, "products"), {
            imgSrc: imgSrc,
            imgs: [],
            name: name,
            price: price,
            seller: {email: seller_email, imgSrc: seller_imgSrc},
            time: serverTimestamp(),
            availability: true
        });
        console.log(id);
        if (imgs0) {
            console.log("0");
            updateDoc(doc(db, "products", id), {
                imgs: arrayUnion(imgs0)
            });
        }
        if (imgs1) {
            console.log("1");
            updateDoc(doc(db, "products", id), {
                imgs: arrayUnion(imgs1)
            });
        }
        if (imgs2) {
            console.log("2");
            updateDoc(doc(db, "products", id), {
                imgs: arrayUnion(imgs2)
            });
        }
        if (imgs3) {
            console.log("3");
            updateDoc(doc(db, "products", id), {
                imgs: arrayUnion(imgs3)
            });
        }
        if (imgs4) {
            console.log("4");
            updateDoc(doc(db, "products", id), {
                imgs: arrayUnion(imgs4)
            });
        }
        
    } catch (err) {
        console.error("error", err);
    }
}

window.addEventListener("load", start);

// https://down-tw.img.susercontent.com/file/cn-11134207-7qukw-ljdvvfzqaliu02
// https://down-tw.img.susercontent.com/file/tw-11134201-7r98y-llbwoni8xqa9f3