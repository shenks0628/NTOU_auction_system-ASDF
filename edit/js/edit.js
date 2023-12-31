import { getProduct, addProduct, updateProduct, uploadImage, deleteStorageFile } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField, Timestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyClpUY1NfcCO_HEHPOi6ma9RXdsSxCGWy4",
//   authDomain: "ntou-auction-system-112eb.firebaseapp.com",
//   projectId: "ntou-auction-system-112eb",
//   storageBucket: "ntou-auction-system-112eb.appspot.com",
//   messagingSenderId: "320414610227",
//   appId: "1:320414610227:web:0ec7e2571126d3b2fd4446",
//   measurementId: "G-FLXQ2BQCZF"
// };
// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = await getAuth();
// const db = getFirestore(app);
// const storage = getStorage();

let id = null;
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
  id = urlParams.get('id');
}

let beDeletedFiles = [], beInsertedFiles = [], shownFiles = [], originFile = [], imageFile = [];
let userData = "none";

async function start() {
  eventSetting();
  await onAuthStateChanged(auth, (user) => {
    // console.log(user);
    if (user) {
      userData = {
        id: user.email,
        imgSrc: user.photoURL
      };
    }
    else {
      userData = "none";
      window.alert("請先登入");
      window.location.href = "../";
    }
  });
  let originProductData;
  if (id != null) {
    originProductData = await getProduct(id);
    if (originProductData != null && userData.id != originProductData.seller) {
      window.alert("無權限修改此商品");
      window.location.href = "../";
    }
  }
  else
    originProductData = await clearProductData();
  inputTypeSet(originProductData);
  await reset();
};
function eventSetting() { // 設定event
  document.getElementById("resetButton").addEventListener("click", reset, false);
  document.getElementById("completeButton").addEventListener("click", showCheckPage, false);
  document.getElementById("checkPageCloseButton").addEventListener("click", closeCheckPage, false);
  document.getElementById("sendButton").addEventListener("click", sendCheck, false);
  document.getElementById("inputType").addEventListener("change", changeType, false);
  document.getElementById("inputImage").addEventListener("change", showImage, false);
}
async function reset() {  // 重置input欄位回原資料
  beDeletedFiles = [];
  beInsertedFiles = [];
  shownFiles = []
  if (id != null) {
    document.getElementById("inputType").disabled = true;
    let productData = await getProduct(id);
    originFile = Array.from(productData.imgs);
    imageFile = Array.from(productData.imgs);
    showData(productData);
  }
  else {
    let productData = await clearProductData();
    originFile = Array.from(productData.imgs);
    imageFile = Array.from(productData.imgs);
    showData(productData);
  }
}
let quantityTmp = "";
function changeType() { // 根據商品種類調整顯示的欄位
  if (document.getElementById("inputType").value == "normal") {
    // console.log("normal");
    document.getElementById("inputQuantity").disabled = false;
    document.getElementById("endTimeContainer").style.display = "none";
    document.getElementById("inputQuantity").value = quantityTmp;
  }
  else if (document.getElementById("inputType").value == "bids") {
    // console.log("bids");
    document.getElementById("inputQuantity").disabled = true;
    document.getElementById("endTimeContainer").style.display = "block";
    quantityTmp = document.getElementById("inputQuantity").value;
    document.getElementById("inputQuantity").value = 1;
  }
}
function inputTypeSet(productData) { // 根據商品種類調整顯示的欄位
  if (productData.type == "normal") {
    // console.log("normal");
    document.getElementById("inputQuantity").disabled = false;
    document.getElementById("endTimeContainer").style.display = "none";
  }
  else if (productData.type == "bids") {
    // console.log("bids");
    document.getElementById("inputQuantity").disabled = true;
    document.getElementById("endTimeContainer").style.display = "block";
  }
}

function showImage() { // 顯示上傳圖片
  let files = document.getElementById("inputImage").files;
  for (let i = 0; i < files.length; i++) {
    beInsertedFiles.push(files[i]);
    let src = URL.createObjectURL(files[i]);
    shownFiles.push(src);
    var img = document.createElement("img");
    img.setAttribute("src", src);
    img.setAttribute("alt", src);
    img.setAttribute("height", "100px");
    img.setAttribute("width", "100px");
    img.setAttribute("title", "點擊以刪除圖片");
    img.style.cursor = "pointer";
    img.onclick = temporaryDeleteImage(src);
    originImage.appendChild(img);
  }
  document.getElementById("inputImage").value = "";
}

async function clearProductData() { // 無資料的productData
  let defaultEndTime = new Date();
  defaultEndTime.setHours(defaultEndTime.getHours() + 8);
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
    time: Timestamp.fromDate(defaultEndTime),
    url: "",
    endtime: Timestamp.fromDate(defaultEndTime)
  };
  return productData;
}

function showData(productData) { // 顯示原商品資料
  // console.log(productData);
  if (productData.type == "normal") {
    document.getElementById("inputType").selectedIndex = 0;
    let str = productData.name.trim().split("#");
    document.getElementById("inputName").value = str[0];
    document.getElementById("inputDescription").value = productData.description.replace(/<br>/g, '\n');;
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
    let originImage = document.getElementById("originImage");
    originImage.innerHTML = "";
    for (let i = 0; i < uploadImage.length; i++) {
      var img = document.createElement("img");
      img.setAttribute("src", uploadImage[i]);
      img.setAttribute("alt", uploadImage[i]);
      img.setAttribute("height", "100px");
      img.setAttribute("width", "100px");
      img.setAttribute("title", "點擊以刪除圖片");
      img.style.cursor = "pointer";
      img.onclick = temporaryDeleteImage(uploadImage[i]);
      originImage.appendChild(img);
    }
    document.getElementById("inputURL").value = productData.url;
  }
  else if (productData.type == "bids") {
    if (id != null && productData.bids_info.who1.length > 0) {
      document.getElementById("inputPrice").disabled = true;;
      document.getElementById("inputDate").disabled = true;
      document.getElementById("inputTime").disabled = true;
    }
    document.getElementById("inputType").selectedIndex = 1;
    let str = productData.name.trim().split("#");
    document.getElementById("inputName").value = str[0];
    document.getElementById("inputDescription").value = productData.description.replace(/<br>/g, '\n');;
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
    let originImage = document.getElementById("originImage");
    originImage.innerHTML = "";
    for (let i = 0; i < uploadImage.length; i++) {
      var img = document.createElement("img");
      img.setAttribute("src", uploadImage[i]);
      img.setAttribute("alt", uploadImage[i]);
      img.setAttribute("height", "50px");
      img.setAttribute("width", "50px");
      img.setAttribute("title", "點擊以刪除圖片");
      img.style.cursor = "pointer";
      img.onclick = temporaryDeleteImage(uploadImage[i]);
      originImage.appendChild(img);
    }
    document.getElementById("inputImage").value = "";
    document.getElementById("inputURL").value = productData.url;

    // console.log(productData.endtime.toDate().getFullYear() + '-' + (productData.endtime.toDate().getMonth() + 1) + '-' + productData.endtime.toDate().getDate());
    document.getElementById("inputDate").value = productData.endtime.toDate().getFullYear() + '-' + ('0' + (productData.endtime.toDate().getMonth() + 1)).slice(-2) + '-' + ('0' + productData.endtime.toDate().getDate()).slice(-2);
    // console.log(('0' + productData.endtime.toDate().getHours()).slice(-2) + ':' + ('0' + productData.endtime.toDate().getMinutes()).slice(-2));
    document.getElementById("inputTime").value = (('0' + productData.endtime.toDate().getHours()).slice(-2) + ':' + ('0' + productData.endtime.toDate().getMinutes()).slice(-2));
  }
}
function temporaryDeleteImage(src) { // 刪除圖片
  return function updateBeDelted(event) {
    for (let i = 0; i < imageFile.length; i++) {
      if (imageFile[i] == src) {
        beDeletedFiles.push(src);
        imageFile.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < shownFiles.length; i++) {
      if (shownFiles[i] == src) {
        shownFiles.splice(i, 1);
        beInsertedFiles.splice(i, 1);
        break;
      }
    }
    document.getElementById("originImage").removeChild(event.target);
  }
}

function preview() { // 預覽 欲開發功能
  // 想法：開一個新table，預覽完之後刪除
}
function validateDateTime() {
  let currentDate = new Date();
  let selectedDate = new Date(document.getElementById("inputDate").value + "T" + document.getElementById("inputTime").value);

  if (selectedDate < currentDate) return false;

  currentDate.setDate(currentDate.getDate() + 7);

  // 檢查所選日期是否在未來7天以内
  if (selectedDate > currentDate) return false;
  return true;
}
function showCheckPage() {
  let type = document.getElementById("inputType").value;
  if (document.getElementById("inputName").checkValidity() == false) {
    window.alert("商品名稱格式錯誤，請修改");
  }
  else if (document.getElementById("inputDescription").checkValidity() == false) {
    window.alert("商品敘述字數超過上限，請修改");
  }
  else if (document.getElementById("inputPrice").checkValidity() == false || (type == "normal" && document.getElementById("inputQuantity").checkValidity() == false)) {
    window.alert("請確認數量以及價格部分");
  }
  else if (document.getElementById("inputTag1").checkValidity() == false || document.getElementById("inputTag2").checkValidity() == false || document.getElementById("inputTag3").checkValidity() == false) {
    window.alert("商品標籤格式錯誤，請修改");
  }
  else if (imageFile.length + shownFiles.length > 10) {
    window.alert("圖片張數超過上限，請刪除部分圖片");
  }
  else if (document.getElementById("inputURL").checkValidity() == false) {
    window.alert("影片格式不正確，請修改");
  }
  else if (type == "bids" && (document.getElementById("inputDate").checkValidity() == false || document.getElementById("inputTime").checkValidity() == false || !validateDateTime())) {
    window.alert("請選擇未來7天内的時間");
  }
  else {
    setCheckPage();
    document.getElementById("overlay").style.display = "flex";
    document.getElementById("checkPage").style.display = "block";
  }
}
function closeCheckPage() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("checkPage").style.display = "none";
}
async function setCheckPage() {
  if (id != null) {
    let originProductData = await getProduct();
    let oldStr = originProductData.name.trim().split("#");
    document.getElementById("oldName").innerHTML = oldStr[0];
    document.getElementById("oldDescription").innerHTML = originProductData.description;
    document.getElementById("oldPrice").innerHTML = originProductData.price;
    document.getElementById("oldQuantity").innerHTML = originProductData.quantity;
    let oldTag = document.getElementById("oldTag");
    oldTag.innerHTML = "";
    var f = false;
    for (var i = 1; i < oldStr.length; i++) {
      if (oldStr[i].length > 0) {
        if (f) oldTag.innerHTML += ", "
        oldTag.innerHTML += oldStr[i];
        f = true;
      }
    }
    document.getElementById("oldImage").innerHTML = "";
    for (let i = 0; i < originFile.length; i++) {
      var img = document.createElement("img");
      img.setAttribute("src", originFile[i]);
      img.setAttribute("alt", originFile[i]);
      img.setAttribute("height", "80px");
      img.setAttribute("width", "80px");
      document.getElementById("oldImage").appendChild(img);
    }
    document.getElementById("oldURL").innerHTML = originProductData.url;
  }

  let newProductData = getInputData();
  let newStr = newProductData.name.trim().split("#");
  document.getElementById("newName").innerHTML = newStr[0];
  document.getElementById("newDescription").innerHTML = newProductData.description;
  document.getElementById("newPrice").innerHTML = newProductData.price;
  document.getElementById("newQuantity").innerHTML = newProductData.quantity;
  let newTag = document.getElementById("newTag");
  newTag.innerHTML = "";
  var f = false;
  for (var i = 1; i < newStr.length; i++) {
    if (newStr[i].length > 0) {
      if (f) newTag.innerHTML += ", "
      newTag.innerHTML += newStr[i];
      f = true;
    }
  }
  document.getElementById("newImage").innerHTML = "";
  for (let i = 0; i < imageFile.length; i++) {
    var img = document.createElement("img");
    img.setAttribute("src", imageFile[i]);
    img.setAttribute("alt", imageFile[i]);
    img.setAttribute("height", "80px");
    img.setAttribute("width", "80px");
    document.getElementById("newImage").appendChild(img);
  }
  for (let i = 0; i < shownFiles.length; i++) {
    var img = document.createElement("img");
    img.setAttribute("src", shownFiles[i]);
    img.setAttribute("alt", shownFiles[i]);
    img.setAttribute("height", "80px");
    img.setAttribute("width", "80px");
    document.getElementById("newImage").appendChild(img);
  }
  document.getElementById("newURL").innerHTML = newProductData.url;
}

async function sendCheck() {
  if (id != null) {
    if (window.confirm("是否確認修改？")) {
      let inputData = getInputData();
      let inputImage = await uploadImage(inputData.imgs);
      inputData.imgs = imageFile.concat(inputImage);
      // console.log(inputData);
      await updateProduct(inputData);
      for (let i = 0; i < beDeletedFiles.length; i++) {
        await deleteStorageFile(beDeletedFiles[i]);
      }
      if (id != null) {
        if (window.innerWidth < 768)
          window.location.href = "../api/mobile.html?id=" + inputData.id;
        else
          window.location.href = "../product?id=" + inputData.id;
      }
      else
        window.location.href = "../";
    }
  }
  else {
    if (window.confirm("是否確認新增？")) {
      let inputData = getInputData();
      let inputImage = await uploadImage(inputData.imgs);
      inputData.imgs = inputImage;
      id = await addProduct(userData, inputData);
      if (id != null) {
        if (window.innerWidth < 768)
          window.location.href = "../api/mobile.html?id=" + id;
        else
          window.location.href = "../product?id=" + id;
      }
      else
        window.location.href = "../";
    }
  }
}

function getInputData() { // 讀取輸入的資料
  let type = document.getElementById("inputType").options[document.getElementById("inputType").selectedIndex].value;
  var inputData;
  if (type == "normal") {
    inputData = {
      id: id,
      type: type,
      name: document.getElementById("inputName").value + ("#" + document.getElementById("inputTag1").value) + ("#" + document.getElementById("inputTag2").value) + ("#" + document.getElementById("inputTag3").value),
      description: document.getElementById("inputDescription").value.replace(/\n/g, "<br>"),
      price: parseInt(document.getElementById("inputPrice").value),
      quantity: parseInt(document.getElementById("inputQuantity").value),
      imgs: beInsertedFiles,
      url: document.getElementById("inputURL").value
    }
  }
  else if (type == "bids") {
    inputData = {
      id: id,
      type: type,
      name: document.getElementById("inputName").value + ("#" + document.getElementById("inputTag1").value) + ("#" + document.getElementById("inputTag2").value) + ("#" + document.getElementById("inputTag3").value),
      description: document.getElementById("inputDescription").value.replace(/\n/g, "<br>"),
      price: parseInt(document.getElementById("inputPrice").value),
      quantity: parseInt(document.getElementById("inputQuantity").value),
      imgs: beInsertedFiles,
      url: document.getElementById("inputURL").value,
      endtime: Timestamp.fromDate(new Date(document.getElementById("inputDate").value + "T" + document.getElementById("inputTime").value))
    }
  }
  return inputData;
}
window.addEventListener("load", start, false);