import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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
const storage = getStorage();

var imgs;
var userID = "none", productOwnerID = "none";
let productData;
let oldProductData, newProductData;
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
                oldProductData = productData;
                newProductData = productData;
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
    document.getElementById("login").addEventListener("click", loginAndlogout, false);
    imgs = document.getElementById("itemPicture"),
        imgs.addEventListener("click", changeImage, false);
    document.getElementById("searchButton").addEventListener("click", searchProduct, false);
    document.getElementById("ToDiscription").addEventListener("click", changeInfo, false);
    document.getElementById("ToComment").addEventListener("click", changeInfo, false);

    document.getElementById("edit").addEventListener("click", edit, false);
    document.getElementById("editPageCloseButton").addEventListener("click", closeEditPage, false);
    document.getElementById("saveButton").addEventListener("click", temporaryStore, false);
    document.getElementById("completeButton").addEventListener("click", updateProduct, false);
}

function loginAndlogout() { // 登入登出
    let login = document.getElementById("login");
    if (login.innerHTML == "登出") {
        signOut(auth);
        profileImage.setAttribute("src", "../images/user.jpg");
    }
    else {
        window.location.href = "../sign/index.html";
    }
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

function edit() { // 修改商品頁面
    // window.alert("目前開放部分修改");

    console.log(newProductData);
    let str = newProductData.name.trim().split("#");
    document.getElementById("inputName").value = str[0];
    document.getElementById("inputDescription").value = newProductData.description;
    document.getElementById("inputPrice").value = newProductData.price;
    document.getElementById("inputQuantity").value = newProductData.quantity;
    if (str[1])
        document.getElementById("inputTag1").value = str[1];
    if (str[2])
        document.getElementById("inputTag2").value = str[2];
    if (str[3])
        document.getElementById("inputTag3").value = str[3];
    let updateImage = newProductData.imgs;
    let oldImage = document.getElementById("oldImage");
    oldImage.innerHTML = "";
    for (let i = 0; i < updateImage.length; i++) {
        var img = document.createElement("img");
        img.setAttribute("src", updateImage[i]);
        img.setAttribute("alt", updateImage[i]);
        img.setAttribute("height", "50px");
        img.setAttribute("width", "50px");
        img.setAttribute("title", "點擊以刪除圖片");
        img.style.cursor = "pointer";
        img.onclick = temporaryDeleteImage(img, updateImage[i]);
        oldImage.appendChild(img);
    }
    document.getElementById("editPage").style.display = "block";
}
function temporaryDeleteImage(img, src) {
    return function updateBeDelted() {
        img.style.display = "none";
        for (let i = 0; i < newProductData.imgs.length; i++) {
            if (src == newProductData.imgs[i]) {
                newProductData.imgs.splice(i, 1);
                break;
            }
        }
        // console.log(newProductData.imgs);
    }
}
function closeEditPage() { // 關閉修改頁面
    if (window.confirm("關閉將不會儲存本次修改，是否確認？")) {
        document.getElementById("editPage").style.display = "none";
        newProductData = oldProductData;
    }
}
function temporaryStore() { // 暫存修改紀錄
    document.getElementById("editPage").style.display = "none";
    newProductData.name = document.getElementById("inputName").value + ("#" + document.getElementById("inputTag1").value) + ("#" + document.getElementById("inputTag2").value) + ("#" + document.getElementById("inputTag3").value);
    newProductData.price = parseInt(document.getElementById("inputPrice").value);
    newProductData.quantity = parseInt(document.getElementById("inputQuantity").value);
    oldProductData = newProductData;
}
const updateProduct = async () => { // 修改並更新資料庫
    try {
        const productId = id; // 替換成實際的產品 ID
        // 使用 doc 函數構建該產品的參考路徑
        const productRef = doc(db, "products", productId);
        let name = document.getElementById("inputName").value;
        if (document.getElementById("inputTag1").value.length != 0) name += ("#" + document.getElementById("inputTag1").value);
        if (document.getElementById("inputTag2").value.length != 0) name += ("#" + document.getElementById("inputTag2").value);
        if (document.getElementById("inputTag3").value.length != 0) name += ("#" + document.getElementById("inputTag3").value);
        await updateDoc(productRef, {
            // bids_info: {},
            // comment: {},
            // type: type,
            imgs: newProductData.imgs,
            name: name,
            description: document.getElementById("inputDescription").value,
            price: parseInt(document.getElementById("inputPrice").value),
            quantity: parseInt(document.getElementById("inputQuantity").value),
            // time: serverTimestamp(),
            // url: ""
        });
        updateImage();
        window.alert("修改成功！");
        getProduct();
        document.getElementById("editPage").style.display = "none";
    } catch (err) {
        console.error("Error: ", err);
    }
}
const updateImage = async () => {
    let inputImage = document.getElementById("inputImage").files;
    for (let i = 0; i < inputImage.length; i++) {
        const storageRef = ref(storage, "images/" + inputImage[i].name);
        await uploadBytes(storageRef, inputImage[i]).then((snapshot) => {
            console.log("Upload Success");
        });
        await getDownloadURL(storageRef).then(async (url) => {
            await updateDoc(doc(db, "products", id), {
                imgs: arrayUnion(url)
            });
        });
    }
    for (let i = 0; i < productData.imgs.length; i++) {
        if (newProductData.imgs.includes(productData.imgs[i])) continue;
        deleteStorageFile(productData.imgs[i]);
    }
}
function preview() { // 預覽 目前不想做
    // let str = newProductData.name.trim().split("#");
    // let itemName = document.getElementById("itemName");
    // itemName.innerHTML = str[0];
    // let itemDescription = document.getElementById("itemDescription");
    // itemDescription.innerHTML = newProductData.description;
    // let itemPrice = document.getElementById("itemPrice");
    // itemPrice.innerHTML = "$" + newProductData.price.toString();
    // let itemTag = document.getElementById("itemTag");
    // if (str.length == 1) itemTag.innerHTML = "無";
    // else {
    //     itemTag.innerHTML = "";
    //     for (var i = 1; i < str.length; i++) {
    //         itemTag.innerHTML += str[i];
    //         if (i != str.length - 1) itemTag.innerHTML += ", "
    //     }
    // }

    // let srcs = newProductData.imgs;
    // imgs.setAttribute("src", srcs[0]);
}
function deleteStorageFile(fileUrl) {
    const fileRef = ref(storage, fileUrl);

    // Delete the file
    deleteObject(fileRef).then(() => {
        // File deleted successfully
        console.log("delete complete");
    }).catch((error) => {
        console.log(error);
        // Uh-oh, an error occurred!
    });
}
window.addEventListener("load", start, false);

// 初始化時顯示購物車內容
