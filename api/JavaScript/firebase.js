// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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

function productSection(id, img, name, price) {
    const newSection = document.createElement('section');
    newSection.className = 'product';
    newSection.innerHTML = `
        <img src="${img}" alt="product-image">
        <div class="product-detail">
            <div>
                <p class="name">${name.split('#')[0]}</p>
                <p class="price">$${price}</p>
            </div>
            <div>
                <button><img src="img/add-cart.png" alt="product-image"></button>
            </div>
        </div>
    `;
    newSection.onclick = function (e) {
        if (!e.target.closest('button')) {
            searchProduct(id);
        } else {
            addCart(id);
        }
    }
    return newSection;
}

async function addProductsToMain(q, t='', p='') {
    const newDiv = document.createElement('div');
    newDiv.className = 'sort-display';
    newDiv.innerHTML = `
        <div class="sort-buttons">
            <button id="timeSortBtn">時間${t}</button>
            <button id="priceSortBtn">價格${p}</button>
        </div>
        <button id="displayBtn"><img src="img/${localStorage.getItem('ASDF-display') !== 'list' ? 'list' : 'menu'}.png"></button>
    `;
    mainElement.appendChild(newDiv);
    timeSortBtn.onclick = function (e) {
        getProducts((t !== '↓') ? '↓' : '↑');
    }
    priceSortBtn.onclick = function (e) {
        getProducts('', (p !== '↑') ? '↑' : '↓');
    }
    displayBtn.onclick = function (e) {
        if (localStorage.getItem('ASDF-display') !== 'list') {
            mainElement.querySelectorAll('section').forEach((section) => {
                section.className = 'product row';
            });
            displayBtn.innerHTML = '<img src="img/menu.png">';
            localStorage.setItem('ASDF-display', 'list');
        } else {
            mainElement.querySelectorAll('section').forEach((section) => {
                section.className = 'product';
            });
            displayBtn.innerHTML = '<img src="img/list.png">';
            localStorage.setItem('ASDF-display', 'menu');
        }
    }
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if (doc.data().name.includes(keywords)) {
            mainElement.appendChild(productSection(doc.id, doc.data().imgs[0], doc.data().name, doc.data().price));
        }
    });
    if (localStorage.getItem('ASDF-display') !== 'menu') {
        mainElement.querySelectorAll('section').forEach((section) => {
            section.className = 'product row';
        });
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
                    <h3>${docSnap.data().name.split('#')[0]}</h3>
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
                <h4>Description</h4>
                <br>
                ${docSnap.data().description}
                <hr>
                <h4>Ratings</h4>
                <br>
                尚無評論
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
        const product = productSection(docSnap.id, docSnap.data().imgs[0], docSnap.data().name, docSnap.data().price);
        product.className = 'product row sticky';
        document.body.appendChild(product);
    } else {
        mainElement.innerHTML = "No such document!";
    }
}

async function getProducts(t = '', p = '') {
    mainElement.innerHTML = '';
    if (urlParams.get('email')) {
        const email = urlParams.get('email');
        const docSnap = await getDoc(doc(db, "users", email));
        if (docSnap.exists()) {
            const newDiv = document.createElement('div');
            newDiv.className = 'profile';
            newDiv.innerHTML = `
                <h2>User Profile</h2>
                <br>
                <img src="${docSnap.data().imgSrc}" alt="User Avatar">
                <div class="profile-name">
                    <span>${docSnap.data().name}</span>
                    <button id="chatBtn"><img src="img/comment-alt-dots.png"></button>
                </div>
                <p>${docSnap.data().score}⭐</p>
                ${(email.endsWith('ntou.edu.tw')) ? '<p>海大認證帳戶</p>' : ''}
            `;
            mainElement.appendChild(newDiv);
            chatBtn.onclick = function (e) {
                alert(email);
            };
            if (t == '↑') {
                addProductsToMain(query(collection(db, "products"), where("seller", "==", email), orderBy("time")), t);
            } else if (t == '↓') {
                addProductsToMain(query(collection(db, "products"), where("seller", "==", email), orderBy("time", "desc")), t);
            } else if (p == '↑') {
                addProductsToMain(query(collection(db, "products"), where("seller", "==", email), orderBy("price")), '', p);
            } else if (p == '↓') {
                addProductsToMain(query(collection(db, "products"), where("seller", "==", email), orderBy("price", "desc")), '', p);
            } else {
                addProductsToMain(query(collection(db, "products"), where("seller", "==", email)));
            }
        } else {
            mainElement.innerHTML = "No such document!";
        }
    } else {
        if (t == '↑') {
            addProductsToMain(query(collection(db, "products"), orderBy("time")), t);
        } else if (t == '↓') {
            addProductsToMain(query(collection(db, "products"), orderBy("time", "desc")), t);
        } else if (p == '↑') {
            addProductsToMain(query(collection(db, "products"), orderBy("price")), '', p);
        } else if (p == '↓') {
            addProductsToMain(query(collection(db, "products"), orderBy("price", "desc")), '', p);
        } else {
            addProductsToMain(collection(db, "products"));
        }
    }
}

async function addCart(id) {
    onAuthStateChanged(auth, async(user) => {
        if (user) {
            try {
                const userSnap = await getDoc(doc(db, "users", user.email));
                const cart = userSnap.data().cart ? userSnap.data().cart : {};
                const productSnap = await getDoc(doc(db, "products", id));
                cart[id] = cart.hasOwnProperty(id) ? cart[id]+1 : 1;
                if (cart[id] > productSnap.data().quantity) {
                    alert('已達庫存上限')
                } else {
                    await updateDoc(doc(db, "users", user.email), {
                        cart: cart
                    });
                    alert('加入成功');
                }
            } catch (error) { alert('加入失敗'); }
        } else {
            window.location.href = '../sign';
        }
    });
}

if (urlParams.get('id')) {
    getProduct(urlParams.get('id'));
} else {
    getProducts();
}