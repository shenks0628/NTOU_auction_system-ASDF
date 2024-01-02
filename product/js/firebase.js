import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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
// const auth = getAuth();
const db = getFirestore(app);
// const storage = getStorage();

async function getProduct(id) { // 讀資料
  const productId = id; // 替換成實際的產品 ID
  // 使用 doc 函數構建該產品的參考路徑
  const productRef = doc(db, "products", productId);
  // 使用 getDoc 函數取得該產品的文件快照
  let productData = getDoc(productRef)
    .then((productDoc) => {
      if (productDoc.exists()) {
        // 取得該產品的資料
        let productData = productDoc.data();
        // console.log("Product data for product with ID", productId, ":", productData);
        return productData;
      }
      else {
        console.log("Product with ID", productId, "does not exist.");
        return null;
      }
    })
    .catch((error) => {
      console.error("Error getting product document:", error);
    });
  return productData;
}

async function updateView(userID, id) {
  if (userID != "none") {
    const userRef = doc(db, "users", userID);
    getDoc(userRef)
      .then((userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData) {
            let viewarr = userData.view;
            let flag = false;
            for (let i = 0; i < viewarr.length; i++) {
              if (viewarr[i] == id) {
                for (let j = i; j >= 1; j--) {
                  viewarr[j] = viewarr[j - 1];
                }
                viewarr[0] = id;
                flag = true;
                break;
              }
            }
            if (!flag) {
              if (viewarr.length < 10) {
                viewarr.push(id);
              }
              for (let i = Math.min(viewarr.length - 1, 9); i >= 1; i--) {
                viewarr[i] = viewarr[i - 1];
              }
              viewarr[0] = id;
            }
            updateDoc(doc(db, "users", userID), {
              view: viewarr
            });
          }
        }
        else {
          console.log("User with ID", userID, "does not exist.");
          return null;
        }
      })
      .catch((error) => {
        console.error("Error getting user document:", error);
      });
  }
}

async function setCart(userId, docId) {
  // console.log(docId);
  const userSnap = await getDoc(doc(db, "users", userId));
  const userData = userSnap.data();
  const cart = userData.cart ? userData.cart : {};
  const productSnap = await getDoc(doc(db, "products", docId));
  const productData = productSnap.data();
  const num = window.prompt("請輸入您想加入的商品數量（僅接受數字輸入，且不可為 '0'）：");
  if (num || num == "") {
    const isNumeric = /^[0-9]+$/.test(num);
    if (!isNumeric || parseInt(num) == 0) {
      window.alert("無效數量！因為您的輸入格式有問題！");
    }
    else {
      cart[docId] = cart.hasOwnProperty(docId) ? cart[docId] + parseInt(num) : parseInt(num);
      // console.log(cart[docId]);
      if (cart[docId] > productData.quantity) {
        window.alert("此商品已達庫存上限！");
      }
      else {
        await updateDoc(doc(db, "users", userId), {
          cart: cart
        });
        window.alert("您已成功將此商品加入購物車！");
      }
    }
  }
  // else {
  //     window.alert("您已取消將商品加入購物車！");
  // }
}
async function addToBids(userId, docId) {
  // const productRef = doc(db, "products", docId);
  // getDoc(productRef)
  //   .then(async (productDoc) => {
  //     if (productDoc.exists()) {
  const productData = await getProduct(docId);
  if (productData != null) {
    let endDate = productData.endtime.toDate();
    if (productData.bids_info.modtime) {
      const tmpDate = productData.bids_info.modtime.toDate();
      tmpDate.setHours(tmpDate.getHours() + 8);
      if (tmpDate < endDate) {
        endDate = tmpDate;
      }
    }
    let currentDate = new Date();
    if (productData.canBid == true && currentDate < endDate) {
      const price = window.prompt("警告：請依您個人經濟能力斟酌下注，若您無法支付您所下注的金額，賣家可以循法律途徑要求您支付！\n請輸入您想下注的最高金額（僅接受數字輸入）：");
      if (price || price == "") {
        const isNumeric = /^[0-9]+$/.test(price);
        if (!isNumeric) {
          window.alert("無效加注！因為您的輸入格式有問題！");
        }
        else {
          const addAmount = window.prompt("請輸入您自動加注的每次增加金額：（僅接受數字輸入，且不可為 '0'）");
          if (addAmount || addAmount == "") {
            const isNumeric1 = /^[0-9]+$/.test(addAmount);
            if (!isNumeric1 || parseInt(addAmount) == 0) {
              window.alert("無效金額！因為您的輸入格式有問題！");
            }
            else {
              // console.log("Product data for product with ID", docId, ":", productData);
              let userData = await getUser(userId);
              let bidsData = userData.bids;
              let currentDate1 = new Date();
              console.log("Product data for product with ID", docId, ":", productData);
              if (parseInt(price) < parseInt(bidsData[docId]) || currentDate1 >= endDate) {
                if (currentDate1 >= endDate) {
                  window.alert("此商品已於剛剛結束競標！");
                }
                else {
                  window.alert("無效加注！因為您的新注金比您原先的注金低！");
                }
              }
              else if (userId == productData.bids_info.who1) {
                await updateDoc(doc(db, "products", docId), {
                  price: Math.min(parseInt(productData.bids_info.price2) + parseInt(addAmount), parseInt(price)),
                  ['bids_info.price1']: parseInt(price),
                  ['bids_info.addAmount']: parseInt(addAmount),
                  ['bids_info.modtime']: serverTimestamp()
                });
                await updateDoc(doc(db, "users", userId), {
                  ['bids.' + docId]: parseInt(price)
                });
                window.alert("加注成功！恭喜您已成為目前的最高下注者！");
              }
              else if (parseInt(price) > parseInt(productData.bids_info.price1)) {
                await updateDoc(doc(db, "products", docId), {
                  price: Math.min(parseInt(productData.bids_info.price1) + parseInt(addAmount), parseInt(price)),
                  ['bids_info.who2']: productData.bids_info.who1,
                  ['bids_info.who1']: userId,
                  ['bids_info.price2']: parseInt(productData.bids_info.price1),
                  ['bids_info.price1']: parseInt(price),
                  ['bids_info.addAmount']: parseInt(addAmount),
                  ['bids_info.modtime']: serverTimestamp()
                });
                await updateDoc(doc(db, "users", userId), {
                  ['bids.' + docId]: parseInt(price)
                });
                window.alert("加注成功！恭喜您已成為目前的最高下注者！");
              }
              else if (userId == productData.bids_info.who2) {
                await updateDoc(doc(db, "products", docId), {
                  price: Math.min(parseInt(price) + parseInt(productData.bids_info.addAmount), parseInt(productData.bids_info.price1)),
                  ['bids_info.price2']: parseInt(price),
                  ['bids_info.modtime']: serverTimestamp()
                });
                await updateDoc(doc(db, "users", userId), {
                  ['bids.' + docId]: parseInt(price)
                });
                window.alert("加注成功！但您下注的金額仍低於目前最高下注者的金額！\n且需注意，若競價金額與您的注金金額相同，您仍不是最高下注者，因為您較晚下注！");
              }
              else if (parseInt(price) > parseInt(productData.bids_info.price2)) {
                await updateDoc(doc(db, "products", docId), {
                  price: Math.min(parseInt(price) + parseInt(productData.bids_info.addAmount), parseInt(productData.bids_info.price1)),
                  ['bids_info.who2']: userId,
                  ['bids_info.price2']: parseInt(price),
                  ['bids_info.modtime']: serverTimestamp()
                });
                await updateDoc(doc(db, "users", userId), {
                  ['bids.' + docId]: parseInt(price)
                });
                window.alert("加注成功！但您下注的金額仍低於目前最高下注者的金額！\n且需注意，若競價金額與您的注金金額相同，您仍不是最高下注者，因為您較晚下注！");
              }
              else {
                await updateDoc(doc(db, "users", userId), {
                  ['bids.' + docId]: parseInt(price)
                });
                window.alert("加注成功！但您下注的金額仍低於目前最高下注者的金額！");
              }
              // resetDisplay();
              window.location.reload();
            }
          }
        }
      }
    }
    else {
      window.alert("此商品已結標！");
      // resetDisplay();
    }
  }
  //   }
  else {
    console.log("Product with ID", docId, "does not exist.");
  }
  // // })
  // // .catch((error) => {
  // //   console.error("Error getting product document:", error);
  // // });
}
async function getUser(email) {
  try {
    const userSnap = await getDoc(doc(db, "users", email));
    // console.log(userSnap.data());
    return userSnap.data();
  } catch (error) { return null; }
}
async function getUserImg(email) {
  let user = await getUser(email);
  if (user != null && user.hasOwnProperty("imgSrc")) {
    return user.imgSrc;
  }
  else {
    return 'img/sheng.jpg';
  }
}
async function getUserName(email) {
  let user = await getUser(email);
  if (user != null && user.hasOwnProperty("name")) {
    return user.name;
  }
  else {
    return "unknown";
  }
}
async function getUserScore(email) {
  let user = await getUser(email);
  if (user != null && user.hasOwnProperty("score") && user.hasOwnProperty("number")) {
    if (user.number == 0) {
      return 0;
    }
    else {
      let score = user.score / user.number;
      return score.toFixed(1);
    }
  }
  else {
    return 0;
  }
}
export { getProduct, updateView, setCart, addToBids, getUserImg, getUserName, getUserScore };