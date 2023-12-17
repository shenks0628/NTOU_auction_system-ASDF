import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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
// const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);
// const storage = getStorage();

var imgs;
var userID = "none", productOwnerID = "none";
let productData;
let id = "dd6VioVhhtD3p6P2r49r";
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
    id = urlParams.get('id');
}
const getProduct = async () => { // 讀資料
    const productId = id; // 替換成實際的產品 ID
    // 使用 doc 函數構建該產品的參考路徑
    const productRef = doc(db, "products", productId);
    // 使用 getDoc 函數取得該產品的文件快照
    getDoc(productRef)
        .then((productDoc) => {
            if (productDoc.exists()) {
                // 取得該產品的資料
                productData = productDoc.data();
                productOwnerID = productData.seller;
                setting(userID, productOwnerID);
                console.log("Product data for product with ID", productId, ":", productData);
                setProduct();
            }
            else {
                console.log("Product with ID", productId, "does not exist.");
            }
        })
        .catch((error) => {
            console.error("Error getting product document:", error);
        });

}
function start() {
    eventSetting();
    getProduct();
    onAuthStateChanged(auth, (user) => {
        console.log(user);
        if (user) { // 登入狀態
            userID = user.email;
        }
        else {
            userID = "none";
        }
        setting(userID, productOwnerID);
    });
};
function eventSetting() {
    imgs = document.getElementById("itemPicture"),
        imgs.addEventListener("click", changeImage, false);
    document.getElementById("ToDiscription").addEventListener("click", changeInfo, false);
    document.getElementById("ToComment").addEventListener("click", changeInfo, false);

    document.getElementById("editButton").addEventListener("click", toEditPage, false);
    // document.getElementById("edit").addEventListener("click", edit, false);
    // document.getElementById("editPageCloseButton").addEventListener("click", closeEditPage, false);
    // document.getElementById("saveButton").addEventListener("click", temporaryStore, false);
    // document.getElementById("completeButton").addEventListener("click", updateProduct, false);
}

function setProduct() { // 設定顯示的商品
    let str = productData.name.trim().split("#");
    let itemName = document.getElementById("itemName");
    itemName.innerHTML = str[0];
    document.title = "商品：" + str[0];
    let itemDescription = document.getElementById("itemDescription");
    itemDescription.innerHTML = productData.description;
    let itemPrice = document.getElementById("itemPrice");
    itemPrice.innerHTML = "$" + productData.price.toString();
    let itemQuantity = document.getElementById("itemQuantity");
    itemQuantity.innerHTML = productData.quantity.toString();
    let itemTag = document.getElementById("itemTag");
    let f = false;
    itemTag.innerHTML = "";
    for (var i = 1; i < str.length; i++) {
        if (str[i].length > 0) {
            if (f) itemTag.innerHTML += ", "
            itemTag.innerHTML += str[i];
            f = true;
        }
    }
    if (f == false) itemTag.innerHTML = "無";

    let srcs = productData.imgs;
    imgs.setAttribute("src", srcs[0]);

    let itemComment = document.getElementById("itemComment");
    let commentArray = productData.comment;
    itemComment.innerHTML = "";
    if (Object.keys(commentArray).length > 0) {
        var commentBlock = document.createElement("div");
        commentBlock.className = "commentBlock";
        var idx = 0;
        for (var key of Object.keys(commentArray)) {
            console.log(key);
            // 創建評論區塊元素
            var commentBlock = document.createElement("div");
            commentBlock.className = "commentBlock";

            // 顯示使用者和部分內容
            if (commentArray[key].length > 50) {
                commentBlock.innerHTML = "<div><strong>" + key + ":</strong><br><span id='comment" + idx + "'>" + commentArray[key].slice(0, 50) + "<span class='readMore'>...點擊查看更多</span>" + "</span></div>";
                commentBlock.onclick = readMore(idx, commentArray[key]);
            }
            else {
                commentBlock.innerHTML = "<p><strong>" + key + ":</strong> " + commentArray[key] + "</p>";
            }
            itemComment.appendChild(commentBlock);
            idx++;
        }
    }
    else {
        itemComment.innerHTML = "此商品暫時沒有評論";
    }
}
function readMore(idx, comment) { // 評論的查看更多
    return function () {
        document.getElementById("comment" + idx).innerHTML = comment;
    }
}

function setting() { // 判定是否為買 or 賣家
    // console.log(userID, productOwnerID);
    if (productOwnerID == "none") return;
    if (userID == "none") {
        document.getElementById("cartButton").style.display = "none";
        let editButton = document.getElementsByClassName("editButton");
        for (var i = 0; i < editButton.length; i++) {
            editButton[i].style.display = "none";
        }
    }
    else if (userID == productOwnerID && productOwnerID != "none") {
        document.getElementById("cartButton").style.display = "none";
        let editButton = document.getElementsByClassName("editButton");
        for (var i = 0; i < editButton.length; i++) {
            editButton[i].style.display = "inline";
        }
    }
    else {
        document.getElementById("cartButton").style.display = "block";
        let editButton = document.getElementsByClassName("editButton");
        for (var i = 0; i < editButton.length; i++) {
            editButton[i].style.display = "none";
        }
    }
}

function changeImage() { // 切換商品照片
    let srcs = productData.imgs;
    for (var i = 0; i < srcs.length; i++) {
        if (srcs[i] == imgs.getAttribute("src")) {
            imgs.setAttribute("src", srcs[(i + 1) % srcs.length]);
            break;
        }
    }
}

function changeInfo() { // 切換商品資訊/評論
    if (document.getElementById("description").style.display == "none") {
        document.getElementById("ToDiscription").disabled = true;
        document.getElementById("ToComment").disabled = false;
        document.getElementById("description").style.display = "block";
        document.getElementById("review").style.display = "none";
    }
    else {
        document.getElementById("ToDiscription").disabled = false;
        document.getElementById("ToComment").disabled = true;
        document.getElementById("description").style.display = "none";
        document.getElementById("review").style.display = "block";
    }
}
function toEditPage() {
    window.location.href = "../edit?id=" + id;
}
window.addEventListener("load", start, false);

// 初始化時顯示購物車內容
