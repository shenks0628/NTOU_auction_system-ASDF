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

var imgs;
var userID = "none", productOwnerID = "none";
let productData;
let newProductData;
let key = "dd6VioVhhtD3p6P2r49r";
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
    key = urlParams.get('id');
}
function start() {
    eventSetting();
    const productId = key; // 替換成實際的產品 ID
    // 使用 doc 函數構建該產品的參考路徑
    const productRef = doc(db, "products", productId);
    // 使用 getDoc 函數取得該產品的文件快照
    getDoc(productRef)
        .then((productDoc) => {
            if (productDoc.exists()) {
                // 取得該產品的資料
                productData = productDoc.data();
                newProductData = productData;
                productOwnerID = productData.seller;
                setting(userID, productOwnerID);
                // console.log("Product data for product with ID", productId, ":", productData);
                setPage();
            }
            else {
                console.log("Product with ID", productId, "does not exist.");
            }
        })
        .catch((error) => {
            console.error("Error getting product document:", error);
        });

    onAuthStateChanged(auth, (user) => {
        let login = document.getElementById("login");
        let profileImage = document.getElementById("profileImage");
        console.log(user);
        if (user) {
            userID = user.email;
            login.innerHTML = "登出";
            profileImage.setAttribute("src", user.photoURL);
        }
        else {
            userID = "none";
            login.innerHTML = "登入";
        }
        setting(userID, productOwnerID);
    });
};
function eventSetting() {
    imgs = document.getElementById("itemPicture"),
        imgs.addEventListener("click", changeImage, false);
    document.getElementById("searchButton").addEventListener("click", searchProduct, false);
    document.getElementById("ToDiscription").addEventListener("click", changeInfo, false);
    document.getElementById("ToComment").addEventListener("click", changeInfo, false);

    document.getElementById("edit").addEventListener("click", edit, false);
    document.getElementById("editPageCloseButton").addEventListener("click", closeEditPage, false);
}

function setPage() {
    let str = productData.name.trim().split("#");
    let itemName = document.getElementById("itemName");
    itemName.innerHTML = str[0];
    let itemDescription = document.getElementById("itemDescription");
    itemDescription.innerHTML = productData.description;
    let itemPrice = document.getElementById("itemPrice");
    itemPrice.innerHTML = "$" + productData.price.toString();
    let itemTag = document.getElementById("itemTag");
    if (str.length == 1) itemTag.innerHTML = "無";
    else {
        itemTag.innerHTML = "";
        for (var i = 1; i < str.length; i++) {
            itemTag.innerHTML += str[i];
            if (i != str.length - 1) itemTag.innerHTML += ", "
        }
    }

    let srcs = productData.imgs;
    imgs.setAttribute("src", srcs[0]);
}

function setting() {
    // console.log(userID, productOwnerID);
    if (productOwnerID == "none") return;
    if (userID == "none") {
        document.getElementById("cartButton").style.display = "none";
        let edit = document.getElementsByClassName("edit");
        for (var i = 0; i < edit.length; i++) {
            edit[i].style.display = "none";
        }
    }
    else if (userID == productOwnerID && productOwnerID != "none") {
        document.getElementById("cartButton").style.display = "none";
        let edit = document.getElementsByClassName("edit");
        for (var i = 0; i < edit.length; i++) {
            edit[i].style.display = "inline";
        }
    }
    else {
        document.getElementById("cartButton").style.display = "block";
        let edit = document.getElementsByClassName("edit");
        for (var i = 0; i < edit.length; i++) {
            edit[i].style.display = "none";
        }
    }
}

function searchProduct() {
    let form = document.getElementById("searchForm");
    let url = "../search/search.html?keyword=" + form.elements["keyword"].value;
    console.log(url);
    window.alert("暫未開放此功能");
    // window.location.href = url;
}

function changeImage() {
    let srcs = productData.imgs;
    for (var i = 0; i < srcs.length; i++) {
        if (srcs[i] == imgs.getAttribute("src")) {
            imgs.setAttribute("src", srcs[(i + 1) % srcs.length]);
            break;
        }
    }
}

function changeInfo() {
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

function edit() {
    console.log("edit");
    let str = newProductData.name.trim().split("#");
    document.getElementById("inputName").setAttribute("value", str[0]);
    document.getElementById("inputDescription").setAttribute("value", newProductData.description);
    document.getElementById("inputPrice").setAttribute("value", newProductData.price);
    document.getElementById("inputQuantity").setAttribute("value", newProductData.quantity);
    document.getElementById("editPage").style.display = "block";
}
function closeEditPage() {
    if (window.confirm("關閉將不會儲存，是否確認？")) {
        document.getElementById("editPage").style.display = "none";
        newProductData = productData;
    }
}

window.addEventListener("load", start, false);

// 初始化時顯示購物車內容
