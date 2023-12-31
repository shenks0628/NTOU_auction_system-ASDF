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
let userId;
let recordItems = [];//購物車的陣列
let recordData;
let url;
let recordTable = document.getElementById('record');
const start = () => {
    const title = document.getElementById("title");
    const div_cart = document.getElementById("record");
    onAuthStateChanged(auth, async (user) => {
        if (user) { // 有登入
            userId = user.email; // 取得當前登入的使用者信箱 (id)
            title.innerHTML = "購買紀錄";
            div_cart.style.display = "";
            console.log(userId);
            const userRef = doc(db, "users", userId);
            // 使用 getDoc 函數取得該使用者的文件快照
            getDoc(userRef)
            .then((userDoc) => {
                if (userDoc.exists()) {
                // 取得該使用者的資料
                const userData = userDoc.data();
                // 確認該使用者是否有 record 資料
                    if (userData && userData.record) {
                        recordData = userData.record;
                        console.log("record data for user with ID", userId, ":", recordData);
                    } else {
                        console.log("User with ID", userId, "does not have record data.");
                    }
                } else {
                console.log("User with ID", userId, "does not exist.");
                }
                start1();
            })
            .catch((error) => {
                console.error("Error getting user document:", error);
            });
            //recorddata存record的id
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
    recordTable.innerHTML = `
    <tr>
        <th>商品圖片</th>
        <th>商品名稱</th>
        <th>價錢</th>
        <th>數量</th>
        <th>評價</th>
    <tr/>
    `;
    for (let key of Object.keys(recordData)){
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
                const pName = productData.name.split('#')[0];
                const newItem = { name: pName, price: parseInt(productData.price, 10), quantity: recordData[key].quantity,key: key,img:productData.imgs[0]};
                console.log(recordData[key].isRate);
                if(recordData[key].isRate){
                    recordItems.push(newItem)
                    console.log(recordItems);
                    const row = document.createElement('tr');
                    if (window.innerWidth <= 767) {
                        url = "../api/mobile.html?id=";
                        console.log("手機");
                    }
                    else {
                        console.log("電腦");
                        url = "../product/index.html?id=";
                    }
                
                    row.innerHTML = `
                        <td>
                            <a href="${url}${newItem.key}">
                                <img src="${newItem.img}" alt="圖片描述" width="100px" height="100px">
                            </a>
                        </td>
                        <td>${newItem.name}</td>
                        <td>${newItem.price} 元</td>
                        <td>${newItem.quantity}</td>
                        <td>已評價</td>
                    `;
                    recordTable.appendChild(row);
                }
                else{
                    recordItems.push(newItem)
                    console.log(recordItems);
                    const row = document.createElement('tr');
                    if (window.innerWidth <= 767) {
                        url = "../api/mobile.html?id=";
                        console.log("手機");
                    }
                    else {
                        console.log("電腦");
                        url = "../product/index.html?id=";
                    }
                    row.innerHTML = `
                        <td>
                            <a href="${url}${newItem.key}">
                                <img src="${newItem.img}" alt="圖片描述" width="100px" height="100px">
                            </a>
                        </td>
                        <td>${newItem.name}</td>
                        <td>${newItem.price} 元</td>
                        <td>${newItem.quantity}</td>
                        <td><button class="remove-button" data-item-name="${newItem.key}">評價</button></td>
                    `;
                    recordTable.appendChild(row);
                    row.addEventListener('click', function(event) {
                        // 檢查點擊的元素是否是按鈕
                        if (event.target.matches('.remove-button')) {
                          // 獲取按鈕的 data-item-name 屬性的值
                            const itemName = event.target.dataset.itemName;
                      
                          // 執行相應的操作
                            console.log(itemName);
                            const commentUrl = "../comment/comment.html?itemName=" + encodeURIComponent(itemName);
                            window.location.href = commentUrl;
                        }
                    });
                }
                // 在每行結尾插入一個橫跨整行的單元格，並在其中放置一條分隔線
                //const separatorRow = document.createElement('tr');
                //const separatorCell = document.createElement('td');
                //separatorCell.setAttribute('colspan', '4'); // 橫跨整行
                //separatorCell.innerHTML = '<hr>'; // 分隔線
                //separatorRow.appendChild(separatorCell);
                //recordTable.appendChild(separatorRow);
            } 
            else {
                (async () => {
                    try {
                        await updateDoc(doc(db, "users", userId), {
                            ['record.' + productId]: deleteField()
                        });
                        console.log('資料更新成功！');
                    } catch (error) {
                        console.error('更新資料時出現錯誤：', error);
                    }
                })();
                console.log("Product with ID", productId, "does not exist.");
            }
        })
        .catch((error) => {
            console.error("Error getting product document:", error);
        });
    };
};
window.addEventListener("load", start);