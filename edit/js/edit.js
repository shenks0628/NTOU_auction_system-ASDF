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


let id = "";
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
  id = urlParams.get('id');
}

let productData;
let beDeletedFiles;
let userID;
const getProduct = async () => { // 讀資料
  const productId = id; // 替換成實際的產品 ID
  // 使用 doc 函數構建該產品的參考路徑
  const productRef = doc(db, "products", productId);
  // 使用 getDoc 函數取得該產品的文件快照
  await getDoc(productRef)
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
  window.alert("目前只開放一般商品");
  eventSetting();
  onAuthStateChanged(auth, (user) => {
    console.log(user);
    if (user) {
      userID = user.email;
      // profileImage.setAttribute("src", user.photoURL);
    }
    else {
      userID = "none";
      window.alert("請先登入");
      // console.log(document.referrer, document.URL);
      window.location.href = "../";
    }
    // setting(userID, productOwnerID);
  });
  if (id.length > 0) {
    getProduct();
  }
};
function eventSetting() {
  // document.getElementById("saveButton").addEventListener("click", temporaryStore, false);
  document.getElementById("resetButton").addEventListener("click", getProduct, false);
  document.getElementById("completeButton").addEventListener("click", showCheckPage, false);
  document.getElementById("checkPageCloseButton").addEventListener("click", closeCheckPage, false);
  document.getElementById("sendButton").addEventListener("click", sendCheck, false);
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
  document.getElementById("inputURL").value = productData.url;
  beDeletedFiles = [];
}
function temporaryDeleteImage(img, src) {
  return function updateBeDelted() {
    beDeletedFiles.push(src);
    img.style.display = "none";
    for (let i = 0; i < productData.imgs.length; i++) {
      if (src == productData.imgs[i]) {
        productData.imgs.splice(i, 1);
        break;
      }
    }
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

function showCheckPage() {
  if (document.getElementById("oldName").valid == false || document.getElementById("oldPrice").valid == false || document.getElementById("oldQuantity").valid == false) {
    window.alert("請填寫完整資料");
  }
  else if (document.getElementById("oldURL").valid == false) {
    window.alert("影片格式不正確，請修改");
  }
  else {
    document.getElementById("checkPage").style.display = "block";
    window.alert("比較系統暫未開放");
  }
}
function closeCheckPage() {
  document.getElementById("checkPage").style.display = "none";
}

async function sendCheck() {
  if (id.length > 0) {
    if (window.confirm("是否確認修改？")) {
      let inputData = readInput();
      let inputImage = await uploadImage(inputData.imgs);
      inputData.imgs = productData.imgs;
      for (let i = 0; i < inputImage.length; i++) {
        inputData.imgs.push(inputImage[i]);
      }
      console.log(inputData);
      await updateProduct(inputData);
      for (let i = 0; i < beDeletedFiles.length; i++) {
        await deleteStorageFile(beDeletedFiles[i]);
      }
      window.alert("修改成功！");
      window.location.href = "../product?id=" + inputData.id;
    }
  }
  else {
    if (window.confirm("是否確認新增？")) {
      let inputData = readInput();
      let inputImage = await uploadImage(inputData.imgs);
      inputData.imgs = inputImage;
      id = await addProduct(inputData);
      window.location.href = "../product?id=" + id;
    }
  }
}

const addProduct = async (inputData) => {
  try {
    const userId = userID;
    let type = "normal";
    // if (normal.checked) {
    //   type = normal.value;
    // }
    // else if (bids.checked) {
    //   type = bids.value;
    // }
    if (type == "normal") {
      let { productID } = await addDoc(collection(db, "products"), {
        comment: {},
        type: type,
        imgs: [],
        name: inputData.name,
        description: inputData.description,
        price: parseInt(inputData.price),
        quantity: parseInt(inputData.quantity),
        seller: userId,
        time: serverTimestamp(),
        url: inputData.url
      });
      window.alert("您已成功新增商品！");
      return productID;
    }
    else if (type == "bids") {
      let { productID } = await addDoc(collection(db, "products"), {
        bids_info: { who1: "", who2: "", price1: parseInt(price), price2: parseInt(0) },
        comment: {},
        type: type,
        imgs: [],
        name: inputData.name,
        description: inputData.description,
        price: parseInt(inputData.price),
        quantity: parseInt(inputData.quantity),
        seller: userId,
        time: serverTimestamp(),
        url: inputData.url
      });
      window.alert("您已成功新增商品！");
      return productID;
    }
  } catch (err) {
    console.log(err);
  }
}

async function uploadImage(inputImage) {
  console.log(inputImage);
  let imageURL = [];
  let dateString = getDateString();
  for (let i = 0; i < inputImage.length; i++) {
    const storageRef = ref(storage, "images/" + dateString);
    await uploadBytes(storageRef, inputImage[i]).then((snapshot) => {
      console.log("Upload Success");
    });
    await getDownloadURL(storageRef).then(async (url) => {
      console.log(url);
      imageURL.push(url.toString());
    });
  }
  return imageURL;
}
async function deleteStorageFile(fileUrl) {
  console.log(fileUrl);
  const fileRef = ref(storage, fileUrl);
  // Delete the file
  await deleteObject(fileRef).then(() => {
    console.log("delete complete");
  }).catch((error) => {
    console.log(error);
    // Uh-oh, an error occurred!
  });
}
async function updateProduct(inputData) { // 修改並更新資料庫
  try {
    const productId = inputData.id; // 替換成實際的產品 ID
    // 使用 doc 函數構建該產品的參考路徑
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      // bids_info: {},
      // comment: {},
      // type: type,
      imgs: inputData.imgs,
      name: inputData.name,
      description: inputData.description,
      price: parseInt(inputData.price),
      quantity: parseInt(inputData.quantity),
      // time: serverTimestamp(),
      url: inputData.url
    });
    // document.getElementById("editPage").style.display = "none";
  } catch (err) {
    console.error("Error: ", err);
  }
}

function getDateString() {
  let date = new Date();
  let dateString = date.getFullYear().toString() + "-" + date.getMonth().toString() + "-" + date.getDate().toString() + " " + date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString();
  return dateString;
}
function readInput() {
  var inputData = {}
  inputData.id = id;
  inputData.name = document.getElementById("inputName").value;
  if (document.getElementById("inputTag1").value.length != 0) inputData.name += ("#" + document.getElementById("inputTag1").value);
  if (document.getElementById("inputTag2").value.length != 0) inputData.name += ("#" + document.getElementById("inputTag2").value);
  if (document.getElementById("inputTag3").value.length != 0) inputData.name += ("#" + document.getElementById("inputTag3").value);
  inputData.description = document.getElementById("inputDescription").value;
  inputData.price = parseInt(document.getElementById("inputPrice").value);
  inputData.quantity = parseInt(document.getElementById("inputQuantity").value);
  inputData.imgs = document.getElementById("inputImage").files;
  inputData.url = document.getElementById("inputURL").value;
  return inputData;
}
window.addEventListener("load", start, false);