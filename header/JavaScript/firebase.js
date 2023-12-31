// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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

async function inputSearch(mode, value) {
    if (mode === '<img src="img/users.png" alt="search mode">') {
        toUrl(`api/?email=${value}`);
    } else {
        const docSnap = await getDoc(doc(db, "products", value));
        if (docSnap.exists()) {
            if (document.body.clientWidth >= 768)
                toUrl(`product/index.html?id=${value}`);
            else
                toUrl(`api/mobile.html?id=${value}`);
        } else {
            toUrl(`api/index.html?search=${value}`);
            if (auth.currentUser) {
                const userSnap = await getDoc(doc(db, "users", auth.currentUser.email));
                const search = userSnap.data().search;
                if (search.length >= 10) {
                    search = search.slice(-9);
                }
                search.push(value);
                updateDoc(doc(db, "users", auth.currentUser.email), { search: search });                
            }
        }
    }
}
searchBarSearch.onclick = async function () {
    if (searchBarInput.value)
        await inputSearch(searchBarMode.innerHTML, searchBarInput.value);
    else
        toUrl('api');
}
menuSearchSearch.onclick = async function () {
    if (menuSearchInput.value)
        await inputSearch(menuSearchMode.innerHTML, menuSearchInput.value);
    else
        toUrl('api');
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        avatarBtn.innerHTML = `<img class="avatar" src="${user.photoURL}" alt="avatar">`;    
        avatarBtn.onclick = function (e) { toggleDropdown(); }
        profileBtn.onclick = function (e) { toggleDropdown(); toUrl('api?email='+user.email); }
        chatBtn.onclick = function (e) { toggleDropdown(); toUrl('chat'); }
        sellBtn.onclick = function (e) { toggleDropdown(); toUrl('selling_list/selling_list.html'); }
        logoutBtn.onclick = function (e) { toggleDropdown(); signOut(auth); mainIframe.src = mainIframe.src; }
    } else {
        avatarBtn.innerHTML = '<img class="avatar" src="img/google.png" alt="google">';
        avatarBtn.onclick = function (e) {
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
                        sold: {},
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