// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs, query, where, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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

function productSection(id, data) {
    const btn = `<button><img src="img/${data.type == 'bids' ? 'auction' : 'add-cart'}.png" alt="add-cart"></button>`;
    const btns = '<button><img src="img/pen.png" alt="edit"></button><button><img src="img/minus.png" alt="remove"></button>';
    const newSection = document.createElement('section');
    newSection.className = 'product';
    newSection.innerHTML = `
        <img src="${data.imgs[0]}" alt="product-image">
        <div class="product-detail">
            <div class="contents">
                <p class="name">${data.name.split('#')[0]}</p>
                <p class="price">$${data.price}</p>
            </div>
            <div class="buttons">${auth.currentUser && data.seller === auth.currentUser.email ? btns : btn}</div>
        </div>
    `;
    newSection.onclick = async function (e) {
        if (!e.target.closest('button')) {
            if (document.body.clientWidth >= 768)
                window.location.href = '../product?id=' + id;
            else
                window.location.href = 'mobile.html?id=' + id;
        } else {
            if (e.target.alt === 'edit') {

            } else if (e.target.alt === 'remove') {
                if (confirm('確定要刪除嗎')) {
                    await deleteDoc(doc(db, "products", id));
                    location.reload();
                }
            } else {
                if (data.type == 'bids')
                    console.log('addBids(id)');
                else
                    addCart(id);
            }
        }
    }
    return newSection;
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

productType.onchange = async function (e) {
    await createProductContainer();
}
timeSortBtn.onclick = async function (e) {
    if (timeSort !== 'desc') {
        timeSort = 'desc';
        priceSort = '';
        await createProductContainer();
        timeSortBtn.innerHTML = '時間↑';
        priceSortBtn.innerHTML = '價格↕️';
    } else {
        timeSort = 'asc';
        priceSort = '';
        await createProductContainer();
        timeSortBtn.innerHTML = '時間↓';
        priceSortBtn.innerHTML = '價格↕️';
    }
}
priceSortBtn.onclick = async function (e) {
    if (priceSort !== 'asc') {
        timeSort = '';
        priceSort = 'asc';
        await createProductContainer();
        timeSortBtn.innerHTML = '時間↕️';
        priceSortBtn.innerHTML = '價格↓';
    } else {
        timeSort = '';
        priceSort = 'desc';
        await createProductContainer();
        timeSortBtn.innerHTML = '時間↕️';
        priceSortBtn.innerHTML = '價格↑';
    }
}

async function createProfileContainer(email) {
    const userDoc = await getDoc(doc(db, "users", email));
    if (userDoc.exists()) {
        const user = userDoc.data();
        const score = Number((user.score/user.number).toFixed(1));
        if (auth.currentUser && email == auth.currentUser.email) {
            profileContainer.innerHTML = `
                <h2>User Profile</h2><br>
                <div class="profile-avatar">
                    <img id="editAvatar" src="${user.imgSrc}" alt="User Avatar">
                    <input id="file" type="file" accept="image/*" style="display: none">
                    <button onclick="file.click()"><img src="img/pen-circle.png"></button>
                </div>
                <div class="profile-name">
                    <span id="editName">${user.name}</span>
                    <button id="editNameBtn"><img src="img/pen-circle.png"></button>
                </div>
                <p>${score}⭐</p><br>
            `;
            editNameBtn.onclick = function (e) {
                const newName = prompt("輸入新的名字:", "");
                if (newName !== null && newName.trim() !== "")
                    uploadName(email, newName);
                else if (newName.trim() === "")
                    alert("名字不能為空，請重新輸入。");
            };
            file.onchange = (event) => {
                uploadAvatar();
            };
        } else {
            profileContainer.innerHTML = `
                <h2>User Profile</h2><br>
                <div class="profile-avatar">
                    <img src="${user.imgSrc}" alt="User Avatar">
                </div>
                <div class="profile-name">
                    <span>${user.name}</span>
                    ${(email.endsWith('ntou.edu.tw')) ? '<button><img src="img/NTOU.png" alt="NTOU logo"></button>' : ''}
                </div>
                <p>${score}⭐</p><br>
            `;
        }
    }

    async function uploadName(email, name) {
        await updateProfile(auth.currentUser, {displayName: name});
        await updateDoc(doc(db, "users", email), {name: name});
        editName.innerHTML = name;
        alert('更新成功');
    }
    async function uploadAvatar() {
        const fileInput = file.files[0];
        if (fileInput) {
            const storage = getStorage();
            const storageRef = ref(storage, `avatar/${auth.currentUser.email}.png`);
            const metadata = {contentType: 'image/png'};
            await uploadBytes(storageRef, fileInput, metadata);
            getDownloadURL(storageRef).then(async(url) => {
                await updateProfile(auth.currentUser, {photoURL: url});
                await updateDoc(doc(db, "users", auth.currentUser.email), {imgSrc: url});
                editAvatar.src = url;
                alert('更新成功');
            });
        }
    }
}
async function createProductContainer() {
    productContainer.innerHTML = '';
    if (urlParams.get('email')) {
        const email = urlParams.get('email');
        const docSnap = await getDoc(doc(db, "users", email));
        if (docSnap.exists()) {
            if (timeSort !== '')
                await createProducts(query(collection(db, "products"), where("seller", "==", email), orderBy("time", timeSort)));
            else if (priceSort !== '')
                await createProducts(query(collection(db, "products"), where("seller", "==", email), orderBy("price", priceSort)));
            else
                await createProducts(query(collection(db, "products"), where("seller", "==", email)));
        }
    } else {
        if (timeSort !== '')
            await createProducts(query(collection(db, "products"), orderBy("time", timeSort)));
        else if (priceSort !== '')
            await createProducts(query(collection(db, "products"), orderBy("price", priceSort)));
        else
            await createProducts(collection(db, "products"));
    }
    if (productContainer.innerHTML === '') productContainer.innerHTML = '<h2>No such document!</h2>';

    async function createProducts(q) {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            if (doc.data().name.includes(keywords) && (productType.value === 'all' || productType.value === doc.data().type))
                productContainer.appendChild(productSection(doc.id, doc.data()));
        });
    }
}

if (urlParams.get('email'))
    createProfileContainer(urlParams.get('email'));
createProductContainer();