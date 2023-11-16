import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc,deleteField } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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

let cartItems = [];//購物車的陣列
let cartTable = document.getElementById('cart');
let totalAmountElement = document.getElementById('totalAmount');

async function removeItem(itemid) {
    if (itemid === undefined) {
        // 可以添加一些额外的处理或直接返回
        console.error("Item name is undefined.");
        return;
    }
    console.log(itemid);
    const userId = "01057115@email.ntou.edu.tw";
    // 使用 where 條件來查詢商品
    await updateDoc(doc(db, "users", userId), {
        ['cart.' + itemid]: deleteField()
    });
    
}


function displayCart() {
    
    // 清空表格內容

    cartTable.innerHTML = `
    <tr>
        <th>商品名稱</th>
        <th>價錢</th>
        <th>數量</th>
        <th>總價</th>
    <tr/>
    `;

    let totalAmount = 0;
    for(var item of cartItems){
        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.price} 元</td>
            <td>${item.quantity}</td>
            <td>${subtotal} 元</td>
            <td><button data-item-name="${item.name}">移除</button></td>
        `;
        cartTable.appendChild(row);
    };

    totalAmountElement.textContent = totalAmount;
}

// 移除購物車中的商品


let cartData;
const start = () => {
    //onAuthStateChanged(auth, async (user) => {
      //  if (user) { // 有登入
        //    const userId = user.email; // 取得當前登入的使用者信箱 (id)
            // ...
        //}
        //else { // 沒有登入
            // ...
        //}
    //});
    const userId = "01057115@email.ntou.edu.tw";
// 使用 doc 函數構建該使用者的參考路徑
    const userRef = doc(db, "users", userId);
// 使用 getDoc 函數取得該使用者的文件快照
    getDoc(userRef)
    .then((userDoc) => {
        if (userDoc.exists()) {
        // 取得該使用者的資料
        const userData = userDoc.data();
        // 確認該使用者是否有 cart 資料
            if (userData && userData.cart) {
                cartData = userData.cart;
                console.log("Cart data for user with ID", userId, ":", cartData);
            } else {
                console.log("User with ID", userId, "does not have cart data.");
            }
        } else {
        console.log("User with ID", userId, "does not exist.");
        }
        start1();
        
    })
    .catch((error) => {
        console.error("Error getting user document:", error);
    });
    //cartdata存cart的id
    
};

const start1 = () => {
    cartTable.innerHTML = `
    <tr>
        <th>商品名稱</th>
        <th>價錢</th>
        <th>數量</th>
        <th>總價</th>
    <tr/>
    `;
    let totalAmount = 0;
    for (let key of Object.keys(cartData)){
        const productId = key; // 替換成實際的產品 ID
        // 使用 doc 函數構建該產品的參考路徑
        const productRef = doc(db, "products", productId);
        // 使用 getDoc 函數取得該產品的文件快照
        getDoc(productRef)
        .then((productDoc) => {
            if (productDoc.exists()) {
            // 取得該產品的資料
            const productData = productDoc.data();
            console.log("Product data for product with ID", productId, ":", productData);
            const newItem = { name: productData.name, price: parseInt(productData.price, 10), quantity: cartData[key],key: key };
            cartItems.push(newItem);
            console.log(cartItems);
            totalAmount += newItem.price * newItem.quantity;
            totalAmountElement.textContent = totalAmount;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${newItem.name}</td>
                <td>${newItem.price} 元</td>
                <td>${newItem.quantity}</td>
                <td>${newItem.price * newItem.quantity} 元</td>
                <td><button data-item-name="${newItem.key}">移除</button></td>
                
            `;
            cartTable.appendChild(row);
            } 
            else {
            console.log("Product with ID", productId, "does not exist.");
            }
        })
        .catch((error) => {
            console.error("Error getting product document:", error);
        });
    };
    cartTable.addEventListener("click", function(event) {
        const clickedElement = event.target;
        if (clickedElement.tagName === "BUTTON") {
            const itemid= clickedElement.getAttribute("data-item-name");
            removeItem(itemid);
            const index = cartItems.findIndex(item => item.key === itemid);
            if (index !== -1) {
                cartItems.splice(index, 1);
                displayCart();
            }
            
        }
    });
};


window.addEventListener("load", start);