import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, doc, setDoc, getDoc, getDocs,updateDoc ,query, orderBy, limit, where, onSnapshot, deleteDoc} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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

const images =[];


const start = () => {

    const title = document.getElementById("title");
    onAuthStateChanged(auth, async (user) =>{
        if (user) {
            const userEmail = user.email;
            const userRef = await getDoc(doc(db, "users", userEmail));
            const userInfo = userRef.data();

            const urlParams = new URLSearchParams(window.location.search);
            console.log(urlParams);
            const itemName = urlParams.get('itemName');
            console.log(itemName);

            var avarta = document.getElementById("avartar");
            var imgAvarta = document.createElement("img");
            imgAvarta.src = userInfo.imgSrc;
            avarta.appendChild(imgAvarta);

            addItemImg(itemName);
            var submitBtn = document.getElementById("submitBtn");
            submitBtn.addEventListener("click", () => {
              var comment = document.getElementById("commentInput");
              var stars = Array.from(document.querySelectorAll('.star'));
              var rating = stars.filter(star => star.classList.contains('active')).length;
              console.log(rating,comment.value,comment.value.length);
              if(comment.value == ""|| rating == 0||comment.value.length > 50) {
                  if(comment.value == "") {
                    window.alert("請輸入評論");
                  }else if(rating == 0) {
                    window.alert("請輸入星星數");
                  }else if(comment.value.length > 50) {
                    window.alert("評論字數超過50字");
                  }
              }else{
                  addcomment(itemName, userEmail)
                  .then(() => {
                    window.alert("評論成功");
                    window.history.back();
                  })
                  .catch(error => {
                    console.error("評論發生錯誤:", error);
                  });
              }
            })

        }else { // 沒有登入
            console.log("沒拿到userid");
            userInfo = undefined;
           title.innerHTML = "請先登入後再來查看";
            comment.style.display = "none";
       }
    })
    
};

async function addItemImg(id) {
    console.log(id);
    const product = await getDoc(doc(db, "products", id));
    const productData = product.data();
    console.log(productData);
    const imgs = productData.imgs;
    console.log(imgs);
    imgs.forEach((element,index) => {
        images[index] = element;
        console.log(index, images[index]); 
    });
}


const addcomment = async(id,userEmail) => {

  var commentInput = document.getElementById("commentInput");
  var stars = Array.from(document.querySelectorAll('.star'));
  var rating = stars.filter(star => star.classList.contains('active')).length;
  var comment = commentInput.value;
  console.log(rating, comment);
  const updatedComment = rating + comment.toString();

  await getDoc(doc(db, "products", id)).then((docx) => {//新增評論
    const data = docx.data();
    data.comment[userEmail] = updatedComment;
    updateDoc(doc(db, "products", id), data);
    const sellerEmail = data.seller;
    getDoc(doc(db, "users", sellerEmail)).then((docx2) => {//添加星數到賣家評分
      const data2 = docx2.data();
      data2.score+=parseInt(rating);
      data2.number++;
      updateDoc(doc(db, "users", sellerEmail), data2);
    })
  })
  await getDoc(doc(db, "users", userEmail)).then((docx) => {
    const data = docx.data();
    const originalQuantity = data.record[id].quantity; // 獲取原始的quantity值
    data.record[id] = {isRate: true, quantity: originalQuantity};
    updateDoc(doc(db, "users", userEmail), data);
  })

};

const display_pic = async() => {
    
var currentIndex = 0;
var productImg = document.getElementById("productImg");
var prevBtn = document.getElementById("prevBtn");
var nextBtn = document.getElementById("nextBtn");

function showImage(index) {
  productImg.src = images[index];
}

function showPrevImage() {
  if (currentIndex === 0) {
    currentIndex = images.length - 1;
  } else {
    currentIndex--;
  }
  showImage(currentIndex);
}

function showNextImage() {
  if (currentIndex === images.length - 1) {
    currentIndex = 0;
  } else {
    currentIndex++;
  }
  showImage(currentIndex);
}

prevBtn.addEventListener("click", showPrevImage);
nextBtn.addEventListener("click", showNextImage);

// 一開始顯示第一張圖片
showImage(currentIndex);
console.log(productImg);
};

window.addEventListener("load", display_pic);
window.addEventListener("load", start);