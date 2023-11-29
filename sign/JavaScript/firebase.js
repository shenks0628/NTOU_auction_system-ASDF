// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, TwitterAuthProvider, getAdditionalUserInfo } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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

signinBtn.onclick = function (e) {
    if (validateEmailPassword(accInput.value, pwdInput.value)) {
        signInWithEmailAndPassword(auth, accInput.value, pwdInput.value)
        .then((userCredential) => {window.history.back();})
        .catch((error) => {errorSpan.innerHTML = error.message;});
    }
};
signupBtn.onclick = function (e) {
    if (!nameInput.value) {
        errorSpan.innerHTML = 'All fields are required.'
    } else if (validateEmailPassword(accInput.value, pwdInput.value)) {
        createUserWithEmailAndPassword(auth, accInput.value, pwdInput.value)
        .then(async(userCredential) => {
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.email), {
                bids: {},
                cart: {},
                name: nameInput.value,
                score: 0.0,
                imgSrc: 'img/user.png'
            });
            window.history.back();
        })
        .catch((error) => {errorSpan.innerHTML = error.message;});
    }
};
googleBtn.onclick = function (e) {
    const providerGoogle = new GoogleAuthProvider();
    signInWithPopup(auth, providerGoogle)
    .then(async (result) => {
        const user = result.user;
        const docSnap = await getDoc(doc(db, "users", user.email));
        if (!docSnap.exists()) {
            await setDoc(doc(db, "users", user.email), {
                bids: {},
                cart: {},
                name: user.displayName,
                score: 0.0,
                imgSrc: user.photoURL
            });
        }
        window.history.back();
    }).catch((error) => {errorSpan.innerHTML = error.message;});
}
/*twitterBtn.onclick = function (e) {
    const provider = new TwitterAuthProvider();
    signInWithPopup(auth, provider)
    .then(async (result) => {
        const user = getAdditionalUserInfo(result).profile;
        const docSnap = await getDoc(doc(db, "users", user.email));
        if (!docSnap.exists()) {
            await setDoc(doc(db, "users", user.email), {
                bids: {},
                cart: {},
                name: user.screen_name,
                score: 0.0,
                imgSrc: user.profile_image_url_https
            });
        }
        window.history.back();
    }).catch((error) => {errorSpan.innerHTML = error.message;});
}*/