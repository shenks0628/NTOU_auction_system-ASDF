import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// https://firebase.google.com/docs/web/setup#available-libraries
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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
// const analytics = getAnalytics(app);
// const auth = await getAuth();
const db = getFirestore(app);
const storage = getStorage();

let productData = null;
async function getProduct(id) { // 讀資料
  if (productData != null) return productData;
  const productId = id; // 替換成實際的產品 ID
  // 使用 doc 函數構建該產品的參考路徑
  const productRef = doc(db, "products", productId);
  // 使用 getDoc 函數取得該產品的文件快照
  productData = await getDoc(productRef)
    .then((productDoc) => {
      if (productDoc.exists()) {
        // 取得該產品的資料
        let productData = productDoc.data();
        // productOwnerID = productData.seller;
        console.log("Product data for product with ID", productId, ":", productData);
        return productData;
      }
      else {
        console.log("Product does not exist.");
      }
    })
    .catch((error) => {
      console.error("Error getting product document:", error);
    });
  return productData;
}
async function addProduct(userData, inputData) {
  try {
    // console.log(inputData);
    const userID = userData.id;
    const seller_imgSrc = userData.imgSrc;
    const type = inputData.type;
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
        time: serverTimestamp(),
        url: inputData.url
      });
      window.alert("您已成功新增商品！");
      return productID;
    }
    else if (type == "bids") {
      let { productID } = await addDoc(collection(db, "products"), {
        bids_info: { who1: "", who2: "", price1: parseInt(inputData.price), price2: parseInt(0), addAmount: inputData.price },
        comment: {},
        type: type,
        imgs: inputData.imgs,
        name: inputData.name,
        description: inputData.description,
        price: parseInt(inputData.price),
        quantity: parseInt(1),
        seller: userID,
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
async function updateProduct(inputData) { // 修改並更新資料庫
  try {
    const productId = inputData.id; // 替換成實際的產品 ID
    // 使用 doc 函數構建該產品的參考路徑
    const productRef = doc(db, "products", productId);
    const type = inputData.type;
    if (type == "normal") {
      await updateDoc(productRef, {
        type: type,
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
    window.alert("修改成功！");
  } catch (err) {
    console.error("Error: ", err);
  }
}
async function uploadImage(inputImage) {
  let imageURL = [];
  let dateString = getDateString();
  for (let i = 0; i < inputImage.length; i++) {
    const storageRef = ref(storage, "images/" + dateString);
    await uploadBytes(storageRef, inputImage[i]).then((snapshot) => {
      console.log("Upload success!");
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
    console.log("Delete complete!");
  }).catch((error) => {
    console.log(error);
    // Uh-oh, an error occurred!
  });
}
function getDateString() {
  let date = new Date();
  let dateString = date.getFullYear().toString() + "-" + date.getMonth().toString() + "-" + date.getDate().toString() + " " + date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString();
  return dateString;
}
export { getProduct, addProduct, updateProduct, uploadImage, deleteStorageFile };