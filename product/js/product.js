import { getProduct, updateView, setCart, addToBids, getUserImg, getUserName, getUserScore } from "./firebase.js";
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth();
// const db = getFirestore(app);
// const storage = getStorage();

// var imgs;
var userID = "none", productOwnerID = "none";
let productData;
let id = "dd6VioVhhtD3p6P2r49r";
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
    id = urlParams.get('id');
}
async function start() {
    eventSetting();
    productData = await getProduct(id);
    productOwnerID = productData.seller;
    setProduct(productData);
    setting(userID, productOwnerID);
    await onAuthStateChanged(auth, (user) => {
        console.log(user);
        if (user) { // 登入狀態
            userID = user.email;
        }
        else {
            userID = "none";
        }
    });
    setting(userID, productOwnerID);
    // console.log(userID, id);
    await updateView(userID, id);
};
function eventSetting() { // 設定event
    document.getElementById("previousImage").addEventListener("click", function (event) { changeImages(event); }, false);
    document.getElementById("nextImage").addEventListener("click", function (event) { changeImages(event); }, false);
    document.getElementById("ToDiscription").addEventListener("click", function (event) { changeInfo(event) }, false);
    document.getElementById("ToComment").addEventListener("click", function (event) { changeInfo(event) }, false);

    document.getElementById("editButton").addEventListener("click", toEditPage, false);
    document.getElementById("cartButton").addEventListener("click", addToCart, false);
    document.getElementById("bidButton").addEventListener("click", addToBidList, false);

    document.getElementById("watchMoreInfo").addEventListener("click", showMoreInfoPage, false);
    document.getElementById("overlay").addEventListener("click", closeMoreInfoPage, false);
}

async function setProduct(productData) { // 設定顯示的商品
    let str = productData.name.trim().split("#");
    document.getElementById("itemName").innerHTML = str[0];
    document.title = "商品：" + str[0];
    document.getElementById("sellerImage").setAttribute("src", await getUserImg(productData.seller));
    document.getElementById("productSeller").setAttribute("href", "../api?email=" + productData.seller);
    document.getElementById("sellerName").innerHTML = (await getUserScore(productData.seller)).toString() + '⭐' + "<br>" + await getUserName(productData.seller);
    document.getElementById("itemPrice").innerHTML = "$" + productData.price.toString();
    if (productData.type == "normal") {
        document.getElementById("productEndTime").style.display = "none";
    }
    else if (productData.type == "bids") {
        let endtime = productData.endtime.toDate();
        if (productData.bids_info.modtime) {
            let tmpDate = productData.bids_info.modtime.toDate();
            tmpDate.setHours(tmpDate.getHours() + 8);
            if (tmpDate < endtime) {
                endtime = tmpDate;
            }
        }
        document.getElementById("itemEndTime").innerHTML = endtime.toLocaleString();
        let now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        if (now > endtime) {
            document.getElementById("itemEndTime").style.color = "red";
        }
        else {
            document.getElementById("itemEndTime").style.color = "black";
        }
    }
    document.getElementById("itemDescription").innerHTML = productData.description;
    document.getElementById("itemQuantity").innerHTML = productData.quantity.toString();
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
    let imgs = document.getElementById("bigImageItem");
    if (srcs.length > 0) {
        imgs.setAttribute("src", srcs[0]);
        if (srcs.length > 1) {
            document.getElementById("changeImageContainer").style.display = "block";
        }
        else {
            document.getElementById("changeImageContainer").style.display = "none";
        }
    }
    else {
        imgs.setAttribute("src", "./images/product.png");
        document.getElementById("changeImageContainer").style.display = "none";
    }

    let itemComment = document.getElementById("itemComment");
    let commentArray = productData.comment;
    itemComment.innerHTML = "";
    if (Object.keys(commentArray).length > 0) {
        var commentBlock = document.createElement("div");
        commentBlock.className = "commentBlock";
        for (var key of Object.keys(commentArray)) {
            console.log(key);
            // 創建評論區塊元素
            var commentBlock = document.createElement("div");
            commentBlock.className = "commentBlock";

            // 顯示使用者和部分內容
            commentBlock.innerHTML = '<div class="comment" style="display:flex;"><a href="../api/index.html?email=' + key + '"><img src="' + await getUserImg(key) + '" alt="' + key + '" width="50px" height="50px" style="border-radius: 50%;"></a>&nbsp<div class="conmmentMessage"><div class="commentScore">' + '⭐'.repeat(commentArray[key][0]) + '</div><div class="commentText">' + commentArray[key].substr(1) + '</div></div></div>';
            itemComment.appendChild(commentBlock);
        }
    }
    else {
        itemComment.innerHTML = "此商品暫時沒有評論";
    }
    if (productData.url.length > 0) {
        document.getElementById("video").setAttribute("src", productData.url);
    }
    else {
        document.getElementById("watchMoreInfo").style.display = "none";
    }
}

function setting() { // 判定是否為買 or 賣家
    // console.log(userID, productOwnerID);
    if (productOwnerID == "none") return;
    if (userID == "none") {
        document.getElementById("cartButton").style.display = "none";
        document.getElementById("bidButton").style.display = "none";
        document.getElementById("editButton").style.display = "none";
    }
    else if (userID == productOwnerID && productOwnerID != "none") {
        document.getElementById("cartButton").style.display = "none";
        document.getElementById("bidButton").style.display = "none";
        document.getElementById("editButton").style.display = "block";
    }
    else {
        if (productData.type == "normal") {
            document.getElementById("cartButton").style.display = "block";
            document.getElementById("bidButton").style.display = "none";
        }
        else if (productData.type == "bids") {
            document.getElementById("cartButton").style.display = "none";
            document.getElementById("bidButton").style.display = "block";
        }
        document.getElementById("editButton").style.display = "none";
    }
}

function changeImages(event) { // 更改顯示的圖片
    var target = event.target;
    let srcs = productData.imgs;
    let imgs = document.getElementById("bigImageItem");
    if (target.getAttribute("id") == "previousImage") { // previous image
        for (var i = 0; i < srcs.length; i++) {
            if (srcs[i] == imgs.getAttribute("src")) {
                imgs.setAttribute("src", srcs[(i - 1 + srcs.length) % srcs.length]);
                break;
            }
        }
    }
    else if (target.getAttribute("id") == "nextImage") { // next image
        for (var i = 0; i < srcs.length; i++) {
            if (srcs[i] == imgs.getAttribute("src")) {
                imgs.setAttribute("src", srcs[(i + 1) % srcs.length]);
                break;
            }
        }
    }
}

function changeInfo(event) { // 切換商品資訊/評論
    if (event.target.getAttribute("id") == "ToDiscription") {
        document.getElementById("ToDiscription").disabled = true;
        document.getElementById("ToComment").disabled = false;
        document.getElementById("description").style.display = "block";
        document.getElementById("review").style.display = "none";
    }
    else if (event.target.getAttribute("id") == "ToComment") {
        document.getElementById("ToDiscription").disabled = false;
        document.getElementById("ToComment").disabled = true;
        document.getElementById("description").style.display = "none";
        document.getElementById("review").style.display = "block";
    }
}

function showMoreInfoPage() { // 顯示更多(影片)
    document.getElementById('overlay').style.display = "flex";
    document.getElementById("moreInfoPage").style.display = "block";
}
function closeMoreInfoPage() { // 關閉顯示更多(影片)
    document.getElementById('overlay').style.display = "none";
    document.getElementById("moreInfoPage").style.display = "none";
    let url = document.getElementById("video").getAttribute("src");
    document.getElementById("video").setAttribute("src", url);
}

function toEditPage() { // 前往編輯頁面
    window.location.href = "../edit?id=" + id;
}
function addToCart() { // 加入購物車
    if (userID == "none") {
        window.alert("請先登入後再來使用此功能！");
        return;
    }
    else {
        setCart(userID, id);
    }
}
function addToBidList() { // 加入競標
    if (userID == "none") {
        window.alert("請先登入後再來使用此功能！");
        return;
    }
    else {
        addToBids(userID, id);
    }
}
window.addEventListener("load", start, false);

// 初始化時顯示購物車內容