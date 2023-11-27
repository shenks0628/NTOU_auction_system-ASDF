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
const storage = getStorage();

const start = () => {
    document.getElementById("insert").addEventListener("click", insert);
};

const insert = async () => {
    try {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.email;
                let imgs = document.getElementById("imgs").files;
                let name = document.getElementById("name").value;
                let description = document.getElementById("description").value;
                let price = document.getElementById("price").value;
                let quantity = document.getElementById("quantity").value;
                let seller_imgSrc = document.getElementById("seller_imgSrc").value;
                let normal = document.getElementById("normal");
                let bids = document.getElementById("bids");
                let type;
                if (normal.checked) {
                    type = normal.value;
                }
                else if (bids.checked) {
                    type = bids.value;
                }
                let url = document.getElementById("url").value;
                let { id } = await addDoc(collection(db, "products"), {
                    bids_info: {who1: "", who2: "", price1: parseInt(price), price2: parseInt(0)},
                    comment: {},
                    type: type,
                    imgs: [],
                    name: name,
                    description: description,
                    price: parseInt(price),
                    quantity: parseInt(quantity),
                    seller: userId,
                    sellerImg: seller_imgSrc,
                    time: serverTimestamp(),
                    url: ""
                });
                console.log(id);
                for (let i = 0; i < imgs.length; i++) {
                    const storageRef = ref(storage, "images/" + imgs[i].name);
                    await uploadBytes(storageRef, imgs[i]).then((snapshot) => {
                        console.log("Upload Success");
                    });
                    getDownloadURL(storageRef).then(async(url) => {
                        await updateDoc(doc(db, "products", id), {
                            imgs: arrayUnion(url)
                        });
                    });
                }
                window.alert("您已成功新增商品！");
            }
        });
        
    } catch (err) {
        console.error("error", err);
    }
}

window.addEventListener("load", start);

// https://down-tw.img.susercontent.com/file/cn-11134207-7qukw-ljdvvfzqaliu02
// https://down-tw.img.susercontent.com/file/tw-11134201-7r98y-llbwoni8xqa9f3