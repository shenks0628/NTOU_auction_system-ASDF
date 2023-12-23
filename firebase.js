// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteField } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
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
let userId, bidsData;

function edit(docId) {
    console.log(docId);
    const url = "edit/index.html?id=" + docId;
    window.location.href = url;
}

async function del(docId) {
    console.log(docId);
    if (confirm('確定要刪除嗎？')) {
        await deleteDoc(doc(db, "products", docId));
        display();
    }
}

async function addToCart(docId) {
    console.log(docId);
    if (userId === undefined) {
        window.alert("請先登入後再來使用此功能！");
        return ;
    }
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
            console.log(cart[docId]);
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
}

async function addToBids(docId) {
    console.log(docId);
    if (userId === undefined) {
        window.alert("請先登入後再來使用此功能！");
        return ;
    }
    const productRef = doc(db, "products", docId);
    getDoc(productRef)
    .then(async (productDoc) => {
        if (productDoc.exists()) {
            const productData = productDoc.data();
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
                                console.log("Product data for product with ID", docId, ":", productData);
                                if (parseInt(price) < parseInt(bidsData[docId])) {
                                    window.alert("無效加注！因為您的新注金比您原先的注金低！");
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
                                display();
                            }
                        }
                    }
                }
            }
            else {
                window.alert("此商品已結標！");
                display();
            }
        }
        else {
            console.log("Product with ID", docId, "does not exist.");
        }
    })
    .catch((error) => {
        console.error("Error getting product document:", error);
    });
}

const handleCheck = (event) => {
    const targetId = event.target.id;
    console.log(targetId);
    // Check if the clicked element is an edit or delete button
    if (targetId.startsWith("edit")) {
        const productId = targetId.slice(4);
        edit(productId);
    }
    else if (targetId.startsWith("del")) {
        const productId = targetId.slice(3);
        del(productId);
    }
    else if (targetId.startsWith("addn")) {
        const productId = targetId.slice(4);
        addToCart(productId);
    }
    else if (targetId.startsWith("addb")) {
        const productId = targetId.slice(4);
        addToBids(productId);
    }
}

const display = async () => {
    const rec_title = document.getElementById("rec_title");
    const prev_view_title = document.getElementById("prev_view_title");
    const latest_normal = document.getElementById("latest_normal");
    const latest_bids = document.getElementById("latest_bids");
    const prev_view = document.getElementById("prev_view");
    const rec = document.getElementById("rec");
    latest_normal.innerHTML = "";
    latest_bids.innerHTML = "";
    prev_view.innerHTML = "";
    rec.innerHTML = "";
    let url;
    if (window.innerWidth <= 767) {
        url = "api/mobile.html?id=";
    }
    else {
        url = "product/index.html?id=";
    }
    onAuthStateChanged(auth, async(user) => {
        if (user) {
            rec_title.innerHTML = "為您推薦的商品";
            prev_view_title.innerHTML = "您最近瀏覽的商品";
            userId = user.email;
            const docSnap = await getDoc(doc(db, "users", userId));
            if (docSnap.exists()) {
                const views = docSnap.data().view;
                const searches = docSnap.data().search;
                bidsData = docSnap.data().bids;
                views.forEach(async (productId) => {
                    console.log(productId);
                    const productDoc = await getDoc(doc(db, "products", productId));
                    if (productDoc.exists()) {
                        const productData = productDoc.data();
                        const productName = productData.name.split('#')[0];
                        const productType = productData.type;
                        const quantity = productData.quantity;
                        const seller = productData.seller;
                        if (userId == seller) {
                            if (productType == "normal") {
                                prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="' + url + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><p><button class="btn" type="submit" id="edit' + productId + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + productId + '">刪除商品</button></p></div>';
                            }
                            else if (productType == "bids") {
                                let endDate = productData.endtime.toDate();
                                if (productData.bids_info.modtime) {
                                    const tmpDate = productData.bids_info.modtime.toDate();
                                    tmpDate.setHours(tmpDate.getHours() + 8);
                                    if (tmpDate < endDate) {
                                        endDate = tmpDate;
                                    }
                                }
                                prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="' + url + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><p><button class="btn" type="submit" id="edit' + productId + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + productId + '">刪除商品</button></p></div>';
                            }
                        }
                        else {
                            if (productType == "normal") {
                                if (quantity == 0) {
                                    prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="' + url + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><button disabled class="disabled_btn" type="submit" id="addn' + productId + '">加入購物車</button></div>';
                                }
                                else {
                                    prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="' + url + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><button class="btn" type="submit" id="addn' + productId + '">加入購物車</button></div>';
                                }
                            }
                            else if (productType == "bids") {
                                let endDate = productData.endtime.toDate();
                                if (productData.bids_info.modtime) {
                                    const tmpDate = productData.bids_info.modtime.toDate();
                                    tmpDate.setHours(tmpDate.getHours() + 8);
                                    if (tmpDate < endDate) {
                                        endDate = tmpDate;
                                    }
                                }
                                let currentDate = new Date();
                                if (currentDate < endDate) {
                                    if (productData.canBid == true) {
                                        prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="' + url + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><button class="btn" type="submit" id="addb' + productId + '">加入競標清單</button></div>';
                                    }
                                    else if (productData.canBid == false) {
                                        prev_view.innerHTML += '<div class="product" id="' + productId + '"><a href="' + url + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><button disabled class="disabled_btn" type="submit" id="addb' + productId + '">加入競標清單</button></div>';
                                    }
                                }
                            }
                        }
                    }
                    else {
                        console.log(productId);
                        await updateDoc(doc(db, "users", userId), {
                            view: arrayRemove(productId)
                        });
                    }
                });
                prev_view.removeEventListener("click", handleCheck);
                prev_view.addEventListener("click", handleCheck);
                const querySnapshot = await getDocs(collection(db, "products"));
                let cnt = 0;
                let arr = [];
                querySnapshot.forEach((productDoc) => {
                    const productData = productDoc.data();
                    const productName = productData.name.split('#')[0];
                    const productType = productData.type;
                    const quantity = productData.quantity;
                    const seller = productData.seller;
                    if (quantity > 0 && userId != seller && cnt < 10 && !arr.includes(productDoc.id)) {
                        searches.forEach(async (keyWord) => {
                            if (productData.name.includes(keyWord) && !arr.includes(productDoc.id)) {
                                cnt++;
                                arr.push(productDoc.id);
                                if (productType == "normal") {
                                    rec.innerHTML += '<div class="product" id="' + productDoc.id + '"><a href="' + url + productDoc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><button class="btn" type="submit" id="addn' + productDoc.id + '">加入購物車</button></div>';
                                }
                                else if (productType == "bids") {
                                    let endDate = productData.endtime.toDate();
                                    if (productData.bids_info.modtime) {
                                        const tmpDate = productData.bids_info.modtime.toDate();
                                        tmpDate.setHours(tmpDate.getHours() + 8);
                                        if (tmpDate < endDate) {
                                            endDate = tmpDate;
                                        }
                                    }
                                    let currentDate = new Date();
                                    if (currentDate < endDate) {
                                        if (productData.canBid == true) {
                                            rec.innerHTML += '<div class="product" id="' + productDoc.id + '"><a href="' + url + productDoc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><button class="btn" type="submit" id="addb' + productDoc.id + '">加入競標清單</button></div>';
                                        }
                                        else if (productData.canBid == false) {
                                            rec.innerHTML += '<div class="product" id="' + productDoc.id + '"><a href="' + url + productDoc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><button disabled class="disabled_btn" type="submit" id="addb' + productDoc.id + '">加入競標清單</button></div>';
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
                if (cnt == 0) {
                    rec_title.innerHTML = "";
                }
                else {
                    rec.removeEventListener("click", handleCheck);
                    rec.addEventListener("click", handleCheck);
                }
            }
        }
        else {
            userId = undefined;
            rec_title.innerHTML = "";
            prev_view_title.innerHTML = "";
        }
    });
    const q_noraml = query(collection(db, "products"), where("type", "==", "normal"), orderBy("time", "desc"), limit(20));
    const q_bids = query(collection(db, "products"), where("type", "==", "bids"), orderBy("time", "desc"), limit(20));
    const queryNormalSnapshot = await getDocs(q_noraml);
    const queryBidsSnapshot = await getDocs(q_bids);
    queryNormalSnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        const productData = doc.data();
        const productName = productData.name.split('#')[0];
        const quantity = productData.quantity;
        if (quantity > 0) {
            const seller = productData.seller;
            if (userId == seller) {
                latest_normal.innerHTML += '<div class="product" id="' + doc.id + '"><a href="' + url + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><p><button class="btn" type="submit" id="edit' + doc.id + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + doc.id + '">刪除商品</button></p></div>';
            }
            else {
                latest_normal.innerHTML += '<div class="product" id="' + doc.id + '"><a href="' + url + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>不二價：</p><p class="price">' + productData.price + '</p><button class="btn" type="sumbit" id="addn' + doc.id + '">加入購物車</button></div>';
            }
        }
    });
    queryBidsSnapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
        const productData = doc.data();
        const productName = productData.name.split('#')[0];
        const quantity = productData.quantity;
        if (quantity > 0) {
            const seller = productData.seller;
            let endDate = productData.endtime.toDate();
            if (productData.bids_info.modtime) {
                const tmpDate = productData.bids_info.modtime.toDate();
                tmpDate.setHours(tmpDate.getHours() + 8);
                if (tmpDate < endDate) {
                    endDate = tmpDate;
                }
            }
            let currentDate = new Date();
            if (currentDate < endDate) {
                if (userId == seller) {
                    latest_bids.innerHTML += '<div class="product" id="' + doc.id + '"><a href="' + url + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><p><button class="btn" type="submit" id="edit' + doc.id + '">編輯商品</button></p><p><button class="btn" type="submit" id="del' + doc.id + '">刪除商品</button></p></div>';
                }
                else {
                    if (productData.canBid == true) {
                        latest_bids.innerHTML += '<div class="product" id="' + doc.id + '"><a href="' + url + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><button class="btn" type="sumbit" id="addb' + doc.id + '">加入競標清單</button></div>';
                    }
                    else if (productData.canBid == false) {
                        latest_bids.innerHTML += '<div class="product" id="' + doc.id + '"><a href="' + url + doc.id + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName +  '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：</p><p class="price">' + productData.price + '</p><button disabled class="disabled_btn" type="sumbit" id="addb' + doc.id + '">加入競標清單</button></div>';
                    }
                }
            }
        }
    });
    latest_normal.removeEventListener("click", handleCheck);
    latest_normal.addEventListener("click", handleCheck);
    latest_bids.removeEventListener("click", handleCheck);
    latest_bids.addEventListener("click", handleCheck);
}

window.addEventListener("load", display);