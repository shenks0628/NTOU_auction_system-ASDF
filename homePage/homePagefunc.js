import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getDownloadURL }from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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

const start = () => {
    document.getElementById("serch").addEventListener("focus",kwserch);
    
};
const kwserch = () => {
  try {

      
  } catch (err) {
      console.error("error", err);
  }
};


const display_img = async() => {
  const displaynewlist = document.getElementById('display_newlist');
  const displaynormallist = document.getElementById('display_normallist');
  const displaybidlist = document.getElementById('display_bidlist');
  const normalRef = query(collection(db, 'products'), where('type','==','normal'), orderBy('time', 'desc'));
  const bidRef = query(collection(db, 'products'), where('type','==','bids'),orderBy('time','desc'));
  const newProductsRef = query(collection(db, 'products'), orderBy('time','desc'));
  const normalImg = [];
  const normalurl = [];
  const bidImg = [];
  const bidurl = [];
  const newProductsImg = [];
  const newProductsurl = [];
  const queryNormalSnapshot = await getDocs(normalRef); 
  const queryBidSnapshot = await getDocs(bidRef); 
  const queryNewSnapshot = await getDocs(newProductsRef); 
  queryNormalSnapshot.forEach((doc) => {
    normalImg.push(doc.data().imgs[0]);
  });
  queryNewSnapshot.forEach((doc) => {
    newProductsImg.push(doc.data().imgs[0]);
  });
  queryBidSnapshot.forEach((doc) => {
    bidImg.push(doc.data().imgs[0]);
  });
  try{ 
    newProductsImg.forEach((url, index) => {
      const newA = document.createElement('a');
      // 创建一个新的 div 元素
      const newDiv = document.createElement('div');
      newDiv.id = 'imageDiv_' + index;  // 为每个 div 元素设置一个唯一的 ID，如果需要的话
      // 创建一个 img 元素
      const newImg = document.createElement('img');
      newImg.src = url;
      newImg.className = 'display_pic';
      newA.href = "https://youtu.be/JRZQGMzbPes?si=A6IdLTDFrLgRxKXn";
      // 将 img 元素添加到 div 元素中
      newDiv.appendChild(newImg); 
      newA.appendChild(newDiv);
      // 将 div 元素添加到显示列表中
      displaynewlist.appendChild(newA);
    });

    normalImg.forEach((url, index) => {
      const newA = document.createElement('a');
      // 创建一个新的 div 元素
      const newDiv = document.createElement('div');
      newDiv.id = 'imageDiv_' + index;  // 为每个 div 元素设置一个唯一的 ID，如果需要的话
      // 创建一个 img 元素
      const newImg = document.createElement('img');
      newImg.src = url;
      newImg.className = 'display_pic';
      // 将 img 元素添加到 div 元素中
      newDiv.appendChild(newImg); 
      newA.href = "https://youtu.be/JRZQGMzbPes?si=A6IdLTDFrLgRxKXn";
      newA.appendChild(newDiv);
      // 将 div 元素添加到显示列表中
      displaynormallist.appendChild(newA);
    });

    bidImg.forEach((url, index) => {
      const newA = document.createElement('a');
      // 创建一个新的 div 元素
      const newDiv = document.createElement('div');
      newDiv.id = 'imageDiv_' + index;  // 为每个 div 元素设置一个唯一的 ID，如果需要的话
      // 创建一个 img 元素
      const newImg = document.createElement('img');
      newImg.src = url;
      newImg.className = 'display_pic';
      // 将 img 元素添加到 div 元素中
      newDiv.appendChild(newImg); 
      newA.href = "https://youtu.be/JRZQGMzbPes?si=A6IdLTDFrLgRxKXn";
      newA.appendChild(newDiv);
      // 将 div 元素添加到显示列表中
      displaybidlist.appendChild(newA);
    });

  }catch(err){
    console.error("error",err);
  }
  
}
window.addEventListener("load", start);
window.addEventListener("load",display_img);

