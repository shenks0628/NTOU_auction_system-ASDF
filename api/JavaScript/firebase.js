// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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
const db = getFirestore(app);

import { doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"; 

async function addProductsToMain(q) {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if (doc.data().name.includes(keywords)) {
            const newSection = document.createElement('section');
            newSection.className = 'product';
            newSection.innerHTML = `
                <img src="${doc.data().imgs[0]}" alt="product-image">
                <div class="product-detail">
                    <div>
                        <h2>${doc.data().name}</h2>
                        <p>$${doc.data().price}</p>
                    </div>
                    <div>
                        <button>Add To Cart</button>
                    </div>
                </div>
            `;
            newSection.onclick = function (event) {
                if (!event.target.closest('button')) {
                    searchProduct(doc.id);
                } else {
                    alert(`Add "${doc.data().name}" to cart`);
                }
            }
            mainElement.appendChild(newSection);
        }
    });
}

async function getProfile(email) {
    const docSnap = await getDoc(doc(db, "users", email));
    if (docSnap.exists()) {
        let mainHTML = `
            <section class="profile">
                <h2>User Profile</h2>
                <br>
                <img src="${docSnap.data().imgSrc}" alt="User Avatar">
                <div class="profile-name">
                    <span>${docSnap.data().name}</span>
                    <button id="chat-btn"><img src="img/comment-alt-dots.png"></button>
                </div>
                <p>${docSnap.data().score}⭐</p>
                ${(email.endsWith('ntou.edu.tw')) ? '<p>海大認證帳戶</p>' : ''}
            </section>
        `;
        mainElement.innerHTML = mainHTML;
        document.getElementById('chat-btn').onclick = () => {
            alert(email);
        };
        addProductsToMain(query(collection(db, "products"), where("seller", "==", email)));
    } else {
        mainElement.innerHTML = "No such document!";
    }
}

async function getProduct(id) {
    const docSnap = await getDoc(doc(db, "products", id));
    if (docSnap.exists()) {
        let buttonsHTML = '';
        docSnap.data().imgs.forEach((img) => {
            buttonsHTML += `<button class="product-button"><img src="${img}" alt="product-image"></button>`;
        });
        let mainHTML = `
            <section class="product-images">
                <img id="product-image" src="${docSnap.data().imgs[0]}" alt="product-image">
                <div>${buttonsHTML}</div>
            </section>
            <section class="product-detail">
                <div>
                    <h3>${docSnap.data().name}</h3>
                    <p>$${docSnap.data().price}</p>
                </div>
                <div>
                    <button class="seller-avatar">
                        <img src="${docSnap.data().sellerImg}" alt="seller-image">
                    </button>
                </div>
            </section>
            <hr>
            <section class="product-description">
                <h4>Product Description</h4>
                <hr>
                <h4>Product Ratings</h4>
            </section>
        `;
        mainElement.innerHTML = mainHTML;
        const productBtns = document.querySelectorAll('.product-button');
        document.querySelector('.seller-avatar').onclick = () => {
            searchUser(docSnap.data().seller);
        };
        productBtns[0].classList.add('choose');
        productBtns.forEach(button => {
            button.addEventListener('click', () => {
                document.getElementById('product-image').src = button.querySelector('img').src;
                productBtns.forEach(btn => {
                    btn.classList.remove('choose');
                });
                button.classList.add('choose');
            });
        });
    } else {
        mainElement.innerHTML = "No such document!";
    }
}

async function getProducts() {
    mainElement.innerHTML = '';
    addProductsToMain(collection(db, "products"));
}

if (urlParams.get('id')) {
    getProduct(urlParams.get('id'));
} else if(urlParams.get('email')) {
    getProfile(urlParams.get('email'));
} else {
    getProducts();
}