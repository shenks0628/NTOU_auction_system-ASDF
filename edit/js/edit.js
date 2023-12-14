import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField, Timestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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
const auth = await getAuth();
const db = getFirestore(app);
const storage = getStorage();

let id = "";
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
  id = urlParams.get('id');
}

let originProductData = null;
let beDeletedFiles, imageFile = [];
let userData = "none";
async function getProduct() { // 讀資料
  const productId = id; // 替換成實際的產品 ID
  // 使用 doc 函數構建該產品的參考路徑
  const productRef = doc(db, "products", productId);
  // 使用 getDoc 函數取得該產品的文件快照
  let productData = await getDoc(productRef)
    .then((productDoc) => {
      if (productDoc.exists()) {
        // 取得該產品的資料
        let productData = productDoc.data();
        // productOwnerID = productData.seller;
        console.log("Product data for product with ID", productId, ":", productData);
        return productData;
      }
      else {
        console.log("Product with ID", productId, "does not exist.");
      }
    })
    .catch((error) => {
      console.error("Error getting product document:", error);
    });
  return productData;
}
async function start() {
  window.alert("尚未完成判定競標商品不能編輯部分");
  eventSetting();
  await onAuthStateChanged(auth, (user) => {
    console.log(user);
    if (user) {
      userData = {
        id: user.email,
        imgSrc: user.photoURL
      };
      // profileImage.setAttribute("src", user.photoURL);
    }
    else {
      userData = "none";
      window.alert("請先登入");
      window.location.href = "../";
    }
  });
  if (id.length > 0) {
    originProductData = await getProduct();
    if (originProductData != null && userData.id != originProductData.seller) {
      window.alert("無權限修改此商品");
      window.location.href = "../";
    }
  }
  else
    originProductData = await clearProductData();
  inputTypeSet();
  await reset();
};
function eventSetting() {
  // document.getElementById("saveButton").addEventListener("click", temporaryStore, false);
  document.getElementById("resetButton").addEventListener("click", reset, false);
  document.getElementById("completeButton").addEventListener("click", showCheckPage, false);
  document.getElementById("checkPageCloseButton").addEventListener("click", closeCheckPage, false);
  document.getElementById("sendButton").addEventListener("click", sendCheck, false);
  document.getElementById("inputType").addEventListener("change", changeType, false);
}
async function reset() {  // 重置input欄位
  if (id.length > 0) {
    document.getElementById("inputType").setAttribute("disabled", true);
    beDeletedFiles = [];
    let productData = await getProduct();
    imageFile = productData.imgs;
    showData(productData);
  }
  else {
    let productData = await clearProductData();
    imageFile = productData.imgs;
    showData(productData);
  }
}
function changeType() {
  inputTypeSet();
}
function inputTypeSet() {
  if (document.getElementById("inputType").value == "normal") {
    // console.log("normal");
    document.getElementById("quantityContainer").style.display = "block";
    document.getElementById("endTimeContainer").style.display = "none";
  }
  else if (document.getElementById("inputType").value == "bids") {
    // console.log("bids");
    document.getElementById("quantityContainer").style.display = "none";
    document.getElementById("endTimeContainer").style.display = "block";
  }
}

async function clearProductData() {
  let productData = {
    bids_info: {},
    type: document.getElementById("inputType").value,
    name: "",
    comment: {},
    imgs: [],
    description: "",
    price: "",
    quantity: "",
    seller: "",
    sellerImg: "",
    time: Timestamp.fromDate(new Date()),
    url: "",
    endtime: Timestamp.fromDate(new Date())
  };
  return productData;
  // document.getElementById("inputName").value = "";
  // document.getElementById("inputDescription").value = "";
  // document.getElementById("inputPrice").value = "";
  // document.getElementById("inputQuantity").value = "";
  // document.getElementById("inputTag1").value = "";
  // document.getElementById("inputTag2").value = "";
  // document.getElementById("inputTag3").value = "";
  // document.getElementById("inputImage").value = "";
  // document.getElementById("inputURL").value = "";
}

function showData(productData) { // 顯示原商品資料
  console.log(productData);
  if (productData.type == "normal") {
    document.getElementById("inputType").selectedIndex = 0;
    let str = productData.name.trim().split("#");
    document.getElementById("inputName").value = str[0];
    document.getElementById("inputDescription").value = productData.description;
    document.getElementById("inputPrice").value = productData.price;
    document.getElementById("inputQuantity").value = productData.quantity;
    if (str[1])
      document.getElementById("inputTag1").value = str[1];
    else
      document.getElementById("inputTag1").value = "";
    if (str[2])
      document.getElementById("inputTag2").value = str[2];
    else
      document.getElementById("inputTag2").value = "";
    if (str[3])
      document.getElementById("inputTag3").value = str[3];
    else
      document.getElementById("inputTag3").value = "";
    let uploadImage = productData.imgs;
    let oldImage = document.getElementById("oldImage");
    oldImage.innerHTML = "";
    for (let i = 0; i < uploadImage.length; i++) {
      var img = document.createElement("img");
      img.setAttribute("src", uploadImage[i]);
      img.setAttribute("alt", uploadImage[i]);
      img.setAttribute("height", "50px");
      img.setAttribute("width", "50px");
      img.setAttribute("title", "點擊以刪除圖片");
      img.style.cursor = "pointer";
      img.onclick = temporaryDeleteImage(img, uploadImage[i]);
      oldImage.appendChild(img);
    }
    document.getElementById("inputImage").value = "";
    document.getElementById("inputURL").value = productData.url;
    document.getElementById("inputDate").value
  }
  else if (productData.type == "bids") {
    document.getElementById("inputType").selectedIndex = 1;
    let str = productData.name.trim().split("#");
    document.getElementById("inputName").value = str[0];
    document.getElementById("inputDescription").value = productData.description;
    document.getElementById("inputPrice").value = productData.price;
    document.getElementById("inputQuantity").value = productData.quantity;
    if (str[1])
      document.getElementById("inputTag1").value = str[1];
    else
      document.getElementById("inputTag1").value = "";
    if (str[2])
      document.getElementById("inputTag2").value = str[2];
    else
      document.getElementById("inputTag2").value = "";
    if (str[3])
      document.getElementById("inputTag3").value = str[3];
    else
      document.getElementById("inputTag3").value = "";
    let uploadImage = productData.imgs;
    let oldImage = document.getElementById("oldImage");
    oldImage.innerHTML = "";
    for (let i = 0; i < uploadImage.length; i++) {
      var img = document.createElement("img");
      img.setAttribute("src", uploadImage[i]);
      img.setAttribute("alt", uploadImage[i]);
      img.setAttribute("height", "50px");
      img.setAttribute("width", "50px");
      img.setAttribute("title", "點擊以刪除圖片");
      img.style.cursor = "pointer";
      img.onclick = temporaryDeleteImage(img, uploadImage[i]);
      oldImage.appendChild(img);
    }
    document.getElementById("inputImage").value = "";
    document.getElementById("inputURL").value = productData.url;

    document.getElementById("inputDate").value = productData.endtime.toDate().toISOString().split('T')[0];
    document.getElementById("inputTime").value = productData.endtime.toDate().toTimeString().substr(0, 8);
  }
}
function temporaryDeleteImage(img, src) {
  return function updateBeDelted() {
    beDeletedFiles.push(src);
    img.style.display = "none";
    for (let i = 0; i < imageFile.length; i++) {
      if (imageFile[i] == src) {
        imageFile.splice(i, 1);
        break;
      }
    }
  }
}

function preview() { // 預覽 目前不想做
  // 想法：開一個新table，預覽完之後刪除
}
function validateDateTime() {
  let currentDate = new Date();
  let selectedDate = new Date(document.getElementById("inputDate").value + "T" + document.getElementById("inputTime").value);

  if (selectedDate < currentDate) return false;

  currentDate.setDate(currentDate.getDate() + 7);

  // 检查所选日期是否在7天以内
  if (selectedDate > currentDate) return false;
  return true;
}
function showCheckPage() {
  let type = document.getElementById("inputType").value;
  if (document.getElementById("inputName").valid == false || document.getElementById("inputPrice").valid == false || document.getElementById("inputQuantity").valid == false) {
    window.alert("請填寫完整資料");
  }
  else if (document.getElementById("inputURL").valid == false) {
    window.alert("影片格式不正確，請修改");
  }
  else if (type == "bids" && (document.getElementById("inputDate").valid == false || document.getElementById("inputTime").valid == false || !validateDateTime())) {
    alert("請選擇未來7天内的時間");
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
      let inputData = getInputData();
      let inputImage = await uploadImage(inputData.imgs);
      inputData.imgs = imageFile.concat(inputImage);
      // console.log(inputData);
      await updateProduct(inputData);
      for (let i = 0; i < beDeletedFiles.length; i++) {
        await deleteStorageFile(beDeletedFiles[i]);
      }
      window.alert("修改成功！");
      if (id != false)
        window.location.href = "../product?id=" + inputData.id;
    }
  }
  else {
    if (window.confirm("是否確認新增？")) {
      let inputData = getInputData();
      let inputImage = await uploadImage(inputData.imgs);
      inputData.imgs = inputImage;
      id = await addProduct(inputData);
      if (id != false)
        window.location.href = "../product?id=" + id;
    }
  }
}

async function addProduct(inputData) {
  try {
    console.log(inputData);
    const userID = userData.id;
    const seller_imgSrc = userData.imgSrc;
    let type = inputData.type;
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
        imgs: inputData.imgs,
        name: inputData.name,
        description: inputData.description,
        price: parseInt(inputData.price),
        quantity: parseInt(inputData.quantity),
        seller: userID,
        sellerImg: seller_imgSrc,
        time: serverTimestamp(),
        url: inputData.url
      });
      window.alert("您已成功新增商品！");
      return productID;
    }
    else if (type == "bids") {
      let { productID } = await addDoc(collection(db, "products"), {
        bids_info: { who1: "", who2: "", price1: parseInt(inputData.price), price2: parseInt(0), modtime: serverTimestamp() },
        comment: {},
        type: type,
        imgs: inputData.imgs,
        name: inputData.name,
        description: inputData.description,
        price: parseInt(inputData.price),
        quantity: parseInt(1),
        seller: userID,
        sellerImg: seller_imgSrc,
        time: serverTimestamp(),
        url: inputData.url,
        endtime: inputData.endtime
      });
      window.alert("您已成功新增商品！");
      return productID;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function uploadImage(inputImage) {
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
    const type = inputData.type;
    if (type == "normal") {
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
    }
    else if (type == "bids") {
      inputData.bids_info.modtime = Timestamp.fromDate(new Date());
      await updateDoc(productRef, {
        bids_info: inputData.bids_info,
        comment: inputData.comment,
        type: type,
        imgs: inputData.imgs,
        name: inputData.name,
        description: inputData.description,
        price: parseInt(inputData.price),
        quantity: parseInt(inputData.quantity),
        // time: serverTimestamp(),
        url: inputData.url,
        endtime: inputData.endtime
      });
    }
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
function getInputData() {
  let type = document.getElementById("inputType").options[document.getElementById("inputType").selectedIndex].value;
  var inputData;
  if (type == "normal") {
    inputData = {
      id: id,
      type: type,
      name: document.getElementById("inputName").value + ("#" + document.getElementById("inputTag1").value) + ("#" + document.getElementById("inputTag2").value) + ("#" + document.getElementById("inputTag3").value),
      description: document.getElementById("inputDescription").value,
      price: parseInt(document.getElementById("inputPrice").value),
      quantity: parseInt(document.getElementById("inputQuantity").value),
      imgs: document.getElementById("inputImage").files,
      url: document.getElementById("inputURL").value
    }
  }
  else if (type == "bids") {
    inputData = {
      id: id,
      type: type,
      name: document.getElementById("inputName").value + ("#" + document.getElementById("inputTag1").value) + ("#" + document.getElementById("inputTag2").value) + ("#" + document.getElementById("inputTag3").value),
      description: document.getElementById("inputDescription").value,
      price: parseInt(document.getElementById("inputPrice").value),
      quantity: parseInt(1),
      imgs: document.getElementById("inputImage").files,
      url: document.getElementById("inputURL").value,
      endtime: Timestamp.fromDate(new Date(document.getElementById("inputDate").value + "T" + document.getElementById("inputTime").value))
    }
  }
  return inputData;
}
window.addEventListener("load", start, false);