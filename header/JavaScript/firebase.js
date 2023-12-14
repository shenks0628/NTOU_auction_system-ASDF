// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

onAuthStateChanged(auth, (user) => {
    if (user) {
        avatarBtn.innerHTML = `<img class="avatar" src="${user.photoURL}" alt="avatar">`;
        googleSignBtn.innerHTML = '登出';        
        googleSignBtn.onclick = function (e) { signOut(auth); }
    } else {
        avatarBtn.innerHTML = '<img class="avatar" src="img/google.png" alt="google">';
        googleSignBtn.innerHTML = '登入';
        googleSignBtn.onclick = function (e) {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                const docSnap = await getDoc(doc(db, "users", user.email));
                if (!docSnap.exists()) {
                    await setDoc(doc(db, "users", user.email), {
                        bids: {},
                        cart: {},
                        message: {},
                        record: {},
                        search: [],
                        view: [],
                        number: 0,
                        score: 0.0,
                        imgSrc: user.photoURL,
                        name: user.displayName
                    });
                }
                mainIframe.src = mainIframe.src;
            }).catch((error) => {});
        }
    }
});