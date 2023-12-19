// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs, query, where, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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

async function getProduct(id) {
    const docSnap = await getDoc(doc(db, "products", id));
    if (docSnap.exists()) {
        const imgs = docSnap.data().imgs;
        const comments = docSnap.data().comment;
        const seller = docSnap.data().seller;
        const btn = `<button><img src="img/${docSnap.data().type == 'bids' ? 'auction' : 'add-cart'}.png" alt="add-cart"></button>`;
        const btns = '<button><img src="img/pen.png" alt="edit"></button><button><img src="img/minus.png" alt="remove"></button>';
        let buttonsHTML = '';
        imgs.forEach((img) => {
            buttonsHTML += `<button class="product-button"><img src="${img}" alt="product-image"></button>`;
        });
        let commentsHTML = Object.keys(comments).length == 0 ? '尚無評論' : '';
        for (let key in comments) {
            commentsHTML += `
                <div class="comment">
                    <a href="index.html?email=${key}"><img src="${await getAvatar(key)}" alt="comment-avatar"></a>
                    <div class="content">
                        <div class="score">${'⭐'.repeat(comments[key][0])}</div>
                        <div class="text">${comments[key].substr(1)}</div>
                    </div>
                </div>
            `;
        }
        productImg.src = imgs[0];
        productSmallImg.src = imgs[0];
        productImgsDiv.innerHTML = buttonsHTML;
        detailDiv.innerHTML = `
            <div><h3>${docSnap.data().name.split('#')[0]}</h3><p>$${docSnap.data().price}</p></div>
            <a href="?email=${seller}"><img class="seller-avatar" src="${await getAvatar(seller)}" alt="seller-avatar"></a>
        `;
        detailSmallDiv.innerHTML = `
            <div class="contents">
                <p class="name">${docSnap.data().name.split('#')[0]}</p>
                <p class="price">$${docSnap.data().price}</p>
            </div>
            <div class="buttons">${auth.currentUser && auth.currentUser.email === seller ? btns : btn}</div>
        `;
        descriptionSpan.innerHTML = docSnap.data().description;
        commentsSpan.innerHTML = commentsHTML;

        const productBtns = document.querySelectorAll('.product-button');
        productBtns[0].classList.add('choose');
        productBtns.forEach(button => {
            button.addEventListener('click', () => {
                productImg.src = button.querySelector('img').src;
                productBtns.forEach(btn => {
                    btn.classList.remove('choose');
                });
                button.classList.add('choose');
            });
        });

        detailSmallDiv.onclick = async function (e) {
            if (!e.target.closest('button')) {
                window.location.href = 'mobile.html?id=' + id;
            } else {
                if (e.target.alt === 'edit') {
    
                } else if (e.target.alt === 'remove') {
                    if (confirm('確定要刪除嗎')) {
                        await deleteDoc(doc(db, "products", id));
                        location.reload();
                    }
                } else {
                    if (docSnap.data().type == 'bids')
                        console.log('addBids(id)');
                    else
                        addCart(id);
                }
            }
        }

        const userSnap = await getDoc(doc(db, "users", auth.currentUser.email));
        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData) {
                let viewarr = userData.view;
                let flag = false;
                for (let i = 0; i < viewarr.length; i++) {
                    if (viewarr[i] == id) {
                        for (let j = i; j >= 1; j--) {
                            viewarr[j] = viewarr[j - 1];
                        }
                        viewarr[0] = id;
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    if (viewarr.length < 10) {
                        viewarr.push(id);
                    }
                    for (let i = Math.min(viewarr.length - 1, 9); i >= 1; i--) {
                        viewarr[i] = viewarr[i - 1];
                    }
                    viewarr[0] = id;
                }
                updateDoc(doc(db, "users", auth.currentUser.email), {
                    view: viewarr
                });
            }
        }
    }
}

async function addCart(id) {
    if (auth.currentUser) {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.email));
        const cart = userSnap.data().cart ? userSnap.data().cart : {};
        const productSnap = await getDoc(doc(db, "products", id));
        const num = window.prompt("選擇數量:");
        if (num || num == "") {
            if (!(/^[1-9]+$/.test(num))) {
                window.alert("無效數量！");
            } else {
                cart[id] = cart.hasOwnProperty(id) ? cart[id] + parseInt(num) : parseInt(num);
                if (cart[id] > productSnap.data().quantity) {
                    window.alert("已達庫存上限！");
                } else {
                    await updateDoc(doc(db, "users", auth.currentUser.email), { cart: cart });
                    window.alert("加入成功！");
                }
            }
        }
    } else { window.alert("請先登入帳號！"); }
}
async function getAvatar(email) {
    try {
        const userSnap = await getDoc(doc(db, "users", email));
        return userSnap.data().imgSrc;
    } catch (error) { return 'img/ASDF.jpg'; }
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
    getProduct(urlParams.get('id'));
}