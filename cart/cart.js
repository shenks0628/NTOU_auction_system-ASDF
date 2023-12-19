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
let cartItems = [];//購物車的陣列
let totalSelectedPrice =0;//總價的變數
let userId;//使用者id
let cartTable = document.getElementById('cart');
let billcheckBtn = document.getElementById('billcheck');//下訂單
let totalAmountElement = document.getElementById('totalAmount');
async function removeItem(itemid) {
    if (itemid === undefined) {
        console.error("Item name is undefined.");
        return;
    }
    console.log(itemid);
    if (userId === undefined) {
        return ;
    }
    await updateDoc(doc(db, "users", userId), {
        ['cart.' + itemid]: deleteField()
    });
}

function encodeEmail(email) {
    return email.replace(/\./g, '_');
}
async function addmessage(itemid,value1) {
    try {
        const docRef = doc(db, 'messages', itemid); // 假設要檢查的文件位於 'messages' 集合中
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            // 取得要更新的文檔的參考
            const docRef = doc(db, 'messages', itemid);
            // 定義要更新的字段和值
            const mapData = new Map();
            mapData.set('content', value1);
            mapData.set('isRecord', false);
            mapData.set('sendEmail', true);
            mapData.set('time', Date.now());
            mapData.set('user', 'system');
            const userIdArray = [Object.fromEntries(mapData)]; // 將 mapData 放入一個陣列中
            const newid=encodeEmail(userId);
            const newData = {
                [newid]: userIdArray
            };
            // 使用 updateDoc 函數進行更新
            await updateDoc(docRef, newData);
            console.log('文檔更新。');
            console.log('文件存在');
        } 
        else {
            const docRe = doc(db, 'messages', itemid);// 新增一個文檔到集合中
            const mapData = new Map();
            mapData.set('content', value1);
            mapData.set('isRecord', false);
            mapData.set('sendEmail', true);
            mapData.set('time', Date.now());
            mapData.set('user', 'system');
            const userIdArray = [Object.fromEntries(mapData)]; // 將 mapData 放入一個陣列中
            const newid=encodeEmail(userId);
            const newData = {
                [newid]: userIdArray
            };
            // 使用 updateDoc 函數進行更新
            await setDoc(docRe, newData);
            console.log('文檔已成功設定或替換。');
            console.log('文件不存在');
        }
    } catch (error) {
        console.error('獲取文檔時出錯：', error);
    }
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
    const title = document.getElementById("title");
    const div_cart = document.getElementById("div_cart");
    onAuthStateChanged(auth, async (user) => {
        if (user) { // 有登入
            userId = user.email; // 取得當前登入的使用者信箱 (id)
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
            userId = undefined;
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
                    const pName = productData.name.split('#')[0];
                    const newItem = { name: pName, price: parseInt(productData.price, 10), quantity: cartData[key],key: key,check:"有貨",Stockquantity:productData.quantity};
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
                    const prName = productData.name.split('#')[0];
                    window.alert("你所選的商品:"+prName+"數量不足,請更新商品數量或移除購物車");
                    const newItem = { name: prName, price: parseInt(productData.price, 10), quantity: cartData[key],key: key,check:"沒貨",Stockquantity:productData.quantity};
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
            const userInput = window.prompt("請輸入您想加入的商品數量（僅接受數字輸入，且不可為 '0'）：");
            if (userInput || userInput == "") { // 按 submit
                const isNumeric = /^[0-9]+$/.test(userInput);
                if (!isNumeric) { // 如果輸入不是全不都數字/輸入空白
                    window.alert("無效修改！因為您的輸入格式有問題！");
                }
                else if(parseInt(userInput)===0){
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
                    (async () => {
                        try {
                            await updateDoc(doc(db, "users", userId), {
                                ['cart.' + itemid]: parseInt(userInput)
                            });
                            console.log('資料更新成功！');
                        } catch (error) {
                            console.error('更新資料時出現錯誤：', error);
                        }
                    })();
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
    billcheckBtn.addEventListener('click', function() {
        const selectedItems = document.querySelectorAll('.item-checkbox:checked');
        // 迭代被勾選的商品，並將其資訊刪除加刪數量
        selectedItems.forEach(item => {
            const itemName = item.getAttribute('data-item-name'); // 取得商品名稱或唯一ID等等
            const productRef = doc(db, "products", itemName);
            // 使用 getDoc 函數取得該產品的文件快照
            getDoc(productRef)
            .then((productDoc) => { //這邊有async
                if (productDoc.exists()) {
                    const productData = productDoc.data();
                    console.log("Product data for product with ID", itemName, ":", productData);
                    const keyToRemove = itemName;
                    const indexToRemove = cartItems.findIndex(item => item.key === keyToRemove);
                    if (indexToRemove !== -1) {
                        const removedItem = cartItems[indexToRemove]; // 找到對應索引的物件
                        const a=productData.quantity;
                        const b = removedItem.quantity;
                        const x = a-b;
                        if(x >=0){
                            removeItem(itemName);
                            console.log(x);
                            const productRef = doc(db, "products", itemName);
                            (async () => {
                                try {
                                    await updateDoc(productRef, {
                                        quantity: x
                                    })
                                        .then(() => {
                                            console.log('庫存更新成功！');
                                        })
                                        .catch((error) => {
                                            console.error('庫存更新數量時出現錯誤：', error);
                                        });
                                    console.log('資料更新成功！');
                                } catch (error) {
                                    console.error('更新資料時出現錯誤：', error);
                                }
                            })();
                            (async () => {
                                try {
                                    //在 Firestore 中獲取使用者資料的參考路徑
                                    await updateDoc(doc(db, 'users', userId), {
                                        [`message.${itemName}`]: removedItem.quantity
                                    })
                                        .then(() => {
                                            console.log('成功新增商品到message中');
                                        })
                                        .catch((error) => {
                                            console.error('新增商品到message時發生錯誤', error);
                                        });
                                    console.log('資料更新成功！');
                                } catch (error) {
                                    console.error('更新資料時出現錯誤：', error);
                                }
                            })();
                            const value1=`${removedItem.name}#${removedItem.price}#${removedItem.quantity}`;
                            console.log(value1);
                            addmessage(itemName,value1);
                            cartItems.splice(indexToRemove, 1);
                            displayCart();
                        }
                        else{
                            window.alert(removedItem.name+"的庫存有更新導致商品數量不足，請重整頁面");
                            removedItem.Stockquantity=productData.quantity;
                            removedItem.check="沒貨";
                            displayCart();
                        }
                    }
                } 
            })
        });
    });
};

window.addEventListener("load", start);
//cart