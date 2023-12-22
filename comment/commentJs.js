import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { writeBatch,collection, doc, setDoc, getDoc, getDocs,updateDoc ,query, orderBy, limit, where, onSnapshot, deleteDoc,deleteField} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
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
    let imgs = document.getElementById("imgs");
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

            addItemImg(itemName).then(async() => {
              display_pic();
            })
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
                  updateOther(itemName, userEmail)
                  .then(async() => {
                    await addcomment(itemName, userEmail).then(() => {
                      window.alert("評論成功");
                      window.history.back();
                    })
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

const updateOther = async(id,userEmail) => {
  await getDoc(doc(db, "users", userEmail)).then(async(docx) => {//更改record的isRate為true
    const data = docx.data();
    const originalQuantity = data.record[id].quantity; // 獲取原始的quantity值
    data.record[id] = {isRate: true, quantity: originalQuantity};
    console.log(data.record[id]);
    updateDoc(doc(db, "users", userEmail), data);
  })
  await getDoc(doc(db, "messages", id)).then((docx3) => {//刪除聊天室
    const data3 = docx3.data();
    var modifiedEmail = userEmail.replace(/\./g, '_');
    console.log(modifiedEmail,data3[modifiedEmail]);
    updateDoc(doc(db, "messages", id),{
      [modifiedEmail]: deleteField()
    })
  })
}

const addcomment = async(id,userEmail) => {
  var commentInput = document.getElementById("commentInput");
  var stars = Array.from(document.querySelectorAll('.star'));
  var rating = stars.filter(star => star.classList.contains('active')).length;
  var comment = commentInput.value;
  console.log(rating, comment);
  const updatedComment = rating + comment.toString();

  await getDoc(doc(db, "products", id)).then(async(docx) => {//新增評論
    const data = docx.data();
    data.comment[userEmail] = updatedComment;
    updateDoc(doc(db, "products", id), data);
    const sellerEmail = data.seller;
    await getDoc(doc(db, "users", sellerEmail)).then(async(docx2) => {//添加星數到賣家評分
      const data2 = docx2.data();
      data2.score+=parseInt(rating);
      data2.number++;
      let total = 0;
      const userQuerySnapshot = await getDocs(collection(db,"users"));
      userQuerySnapshot.forEach((doc) => {
        const data3 = doc.data();
        if (data3.record[id] && data3.record[id].isRate) {//更新賣家販賣商品數量
          console.log(data3.name, data3.record);
          total += data3.record[id].quantity;
          console.log(total);
        }
      });
      data2.sold[id] = total;
      console.log("sold",data2.sold[id]);
      await updateDoc(doc(db, "users", sellerEmail), data2);//更新賣家評分及販賣商品數量
    })
  })
};



const display_pic = () => {
  var currentIndex = 0;
  var productImg = document.getElementById("productImg");

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

  function showNextImageOnClick() {
    showNextImage();
  }

  // 添加點擊事件監聽器到圖片
  productImg.addEventListener("click", showNextImageOnClick);

  // 一開始顯示第一張圖片
  showImage(currentIndex);
};
window.addEventListener("load", start);