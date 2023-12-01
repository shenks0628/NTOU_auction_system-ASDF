import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
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


let id = "dd6VioVhhtD3p6P2r49r";
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
  id = urlParams.get('id');
}

let productData;
let userID;
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
        // productOwnerID = productData.seller;
        console.log("Product data for product with ID", productId, ":", productData);
        // setProduct();
        showData();
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
  onAuthStateChanged(auth, (user) => {
    console.log(user);
    if (user) {
      userID = user.email;
      // profileImage.setAttribute("src", user.photoURL);
    }
    else {
      userID = "none";
      // block page?
      window.alert("請先登入");
      // console.log(document.referrer, document.URL);
      window.location.href = "../";
    }
    // setting(userID, productOwnerID);
  });
  getProduct();
};
function eventSetting() {
  // document.getElementById("saveButton").addEventListener("click", temporaryStore, false);
  document.getElementById("resetButton").addEventListener("click", getProduct, false);
  document.getElementById("completeButton").addEventListener("click", updateProduct, false);
}

function showData() { // 顯示原商品資料
  // window.alert("目前開放部分修改");
  console.log(productData);
  let str = productData.name.trim().split("#");
  document.getElementById("inputName").value = str[0];
  document.getElementById("inputDescription").value = productData.description;
  document.getElementById("inputPrice").value = productData.price;
  document.getElementById("inputQuantity").value = productData.quantity;
  if (str[1])
    document.getElementById("inputTag1").value = str[1];
  if (str[2])
    document.getElementById("inputTag2").value = str[2];
  if (str[3])
    document.getElementById("inputTag3").value = str[3];
  let updateImage = productData.imgs;
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
  document.getElementById("inputImage").value = "";
  // document.getElementById("editPage").style.display = "block";
}
function temporaryDeleteImage(img, src) {
  return function updateBeDelted() {
    img.style.display = "none";
    for (let i = 0; i < productData.imgs.length; i++) {
      if (src == productData.imgs[i]) {
        productData.imgs.splice(i, 1);
        break;
      }
    }
    // console.log(newProductData.imgs);
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
      imgs: productData.imgs,
      name: name,
      description: document.getElementById("inputDescription").value,
      price: parseInt(document.getElementById("inputPrice").value),
      quantity: parseInt(document.getElementById("inputQuantity").value),
      // time: serverTimestamp(),
      // url: ""
    });
    updateImage();
    window.alert("修改成功！");
    window.location.href = "../product/?id=" + id;
    // document.getElementById("editPage").style.display = "none";
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
    if (productData.imgs.includes(productData.imgs[i])) continue;
    deleteStorageFile(productData.imgs[i]);
  }
}

window.addEventListener("load", start, false);