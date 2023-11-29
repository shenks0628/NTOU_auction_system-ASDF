import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc,deleteField } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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
let totalSelectedPrice =0;//總價的變數
let userId;//使用者id
let cartTable = document.getElementById('cart');
let totalAmountElement = document.getElementById('totalAmount');
async function removeItem(itemid) {
    if (itemid === undefined) {
        console.error("Item name is undefined.");
        return;
    }
    console.log(itemid);
    await updateDoc(doc(db, "users", userId), {
        ['cart.' + itemid]: deleteField()
    });
}
function displayCart() {
    // 清空表格內容
    cartTable.innerHTML = `
    <tr>
        <th></th>
        <th>商品名稱</th>
        <th>價錢</th>
        <th>數量</th>
        <th>總價</th>
        <th>是否有貨</th>
    <tr/>
    `;
    console.log("有進來這裡面");
    let totalAmount = 0;
    for(var item of cartItems){
        if(item.check==="有貨"){
            const subtotal = item.price * item.quantity;
            totalAmount += subtotal;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="item-checkbox" data-item-name="${item.key}"></td>
                <td>${item.name}</td>
                <td>${item.price} 元</td>
                <td>${item.quantity}</td>
                <td>${subtotal} 元</td>
                <td>${item.check}</td>
                <td><button class="remove-button" data-item-name="${item.key}">移除</button></td>
                <td><button class="another-button" data-item-name="${item.key}">修改數量</button></td>
            `;
            cartTable.appendChild(row);
        }
        else{
            const row = document.createElement('tr');
            const subtotal = item.price * item.quantity;
            row.innerHTML = `
                <td></td>
                <td>${item.name}</td>
                <td>${item.price} 元</td>
                <td>${item.quantity}</td>
                <td>${subtotal} 元</td>
                <td>${item.check}</td>
                <td><button class="remove-button" data-item-name="${item.key}">移除</button></td>
                <td><button class="another-button" data-item-name="${item.key}">修改數量</button></td>
            `;
            cartTable.appendChild(row);
        }
        
    };
    totalSelectedPrice = 0;
    totalAmountElement.textContent = totalSelectedPrice ;
    
}
let cartData;
const start = () => {
    const login = document.getElementById("login");
    const title = document.getElementById("title");
    const div_cart = document.getElementById("div_cart");
    onAuthStateChanged(auth, async (user) => {
        if (user) { // 有登入
            userId = user.email; // 取得當前登入的使用者信箱 (id)
            login.innerHTML = "登出";
            title.innerHTML = "購物車";
            div_cart.style.display = "";
            console.log(userId);
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
        }
        else { // 沒有登入
            console.log("沒拿到userid");
            login.innerHTML = "登入";
            title.innerHTML = "請先登入後再來查看";
            div_cart.style.display = "none";
        }
    });
};
const start1 = () => {
    cartTable.innerHTML = `
    <tr>
        <th></th>
        <th>商品名稱</th>
        <th>價錢</th>
        <th>數量</th>
        <th>總價</th>
        <th>是否有貨</th>
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
                if(cartData[key]<=productData.quantity){
                    const newItem = { name: productData.name, price: parseInt(productData.price, 10), quantity: cartData[key],key: key,check:"有貨",Stockquantity:productData.quantity};
                    cartItems.push(newItem);
                    console.log(cartItems);
                    totalAmount += newItem.price * newItem.quantity;
                    //totalAmountElement.textContent = 0;
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><input type="checkbox" class="item-checkbox" data-item-name="${newItem.key}"></td>
                        <td>${newItem.name}</td>
                        <td>${newItem.price} 元</td>
                        <td>${newItem.quantity}</td>
                        <td>${newItem.price * newItem.quantity} 元</td>
                        <td>${newItem.check}<td/>
                        <td><button class="remove-button" data-item-name="${newItem.key}">移除</button></td>
                        <td><button class="another-button" data-item-name="${newItem.key}">修改數量</button></td>
                    `;
                    cartTable.appendChild(row);
                }
                else{
                    window.alert("你所選的商品:"+productData.name+"數量不足,請更新商品數量或移除購物車");
                    const newItem = { name: productData.name, price: parseInt(productData.price, 10), quantity: cartData[key],key: key,check:"沒貨",Stockquantity:productData.quantity};
                    cartItems.push(newItem);
                    console.log(cartItems);
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td></td>
                        <td>${newItem.name}</td>
                        <td>${newItem.price} 元</td>
                        <td>${newItem.quantity}</td>
                        <td>${newItem.price * newItem.quantity} 元</td>
                        <td>${newItem.check}<td/>
                        <td><button class="remove-button" data-item-name="${newItem.key}">移除</button></td>
                        <td><button class="another-button" data-item-name="${newItem.key}">修改數量</button></td>
                        
                    `;
                    cartTable.appendChild(row);
                }
            } 
            else {
            console.log("Product with ID", productId, "does not exist.");
            }
        })
        .catch((error) => {
            console.error("Error getting product document:", error);
        });
    };
    cartTable.addEventListener("click", function (event) {
        const clickedElement = event.target;
        if (clickedElement.classList.contains("remove-button")) {
            const itemid = clickedElement.getAttribute("data-item-name");
            removeItem(itemid);
            const index = cartItems.findIndex(item => item.key === itemid);
            if (index !== -1) {
                cartItems.splice(index, 1);
                displayCart();
            }
        }
    });
    cartTable.addEventListener("click", function (event) {
        const clickedElement = event.target;
        if (clickedElement.classList.contains("another-button")) {
            const itemid = clickedElement.getAttribute("data-item-name");
            const userInput = window.prompt("請輸入一個數字：");
            if (userInput || userInput == "") { // 按 submit
                const isNumeric = /^[0-9]+$/.test(userInput);
                if (!isNumeric) { // 如果輸入不是全不都數字/輸入空白
                    window.alert("無效修改！因為您的輸入格式有問題！");
                }
                else { // 輸入都是數字（正常）
                    for(var item of cartItems){
                        if(item.key===itemid){
                            item.quantity=parseInt(userInput);
                            if(item.quantity<=item.Stockquantity){
                                item.check="有貨";
                            }
                            else{
                                window.alert("你所選的商品:"+item.name+"數量不足,請更新商品數量或移除購物車");
                                item.check="沒貨";
                            }
                        }
                    }
                    updateDoc(doc(db, "users", userId), {
                        ['cart.' + itemid]: parseInt(userInput)
                    });
                    displayCart();
                }
            }
            else { // 按 cancel
                window.alert("您已取消！");
            }
            
        }
    });
    cartTable.addEventListener('change', (event) => {//有勾選的顯示總價
        if (event.target.classList.contains('item-checkbox')) {
            const itemName = event.target.getAttribute('data-item-name');
            const isChecked = event.target.checked;//確認是否勾選
            const selectedItem = cartItems.find(item => item.key === itemName);//確認購物車裡是否有它
            if (isChecked && selectedItem) {
                totalSelectedPrice += selectedItem.price * selectedItem.quantity;
            } else {
                totalSelectedPrice -= selectedItem.price * selectedItem.quantity;
            }
        }
        totalAmountElement.textContent =totalSelectedPrice;
    });
    login.onclick = () => {
        signOut(auth);
    }
};

window.addEventListener("load", start);
