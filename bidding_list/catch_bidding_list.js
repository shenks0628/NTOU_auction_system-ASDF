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

let bidsData, userId;

function add(docId) {
    console.log(docId);
    if (userId === undefined) {
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
                                start();
                            }
                        }
                    }
                }
            }
            else {
                window.alert("此商品已結標！");
                start();
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

function exit(docId) {
    console.log(docId);
    if (userId === undefined) {
        return ;
    }
    const productRef = doc(db, "products", docId);
    getDoc(productRef)
    .then(async (productDoc) => {
        if (productDoc.exists()) {
            const productData = productDoc.data();
            if (productData.bids_info.who1 == userId) {
                window.alert("您目前為最高下注者，不得退出競標！");
            }
            else {
                await updateDoc(doc(db, "users", userId), {
                    ['bids.' + docId]: deleteField()
                });
            }
            start();
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
    if (targetId.startsWith("add")) {
        const productId = targetId.slice(3);
        add(productId);
    }
    else if (targetId.startsWith("exit")) {
        const productId = targetId.slice(4);
        exit(productId);
    }
}

const start1 = async () => {
    console.log(bidsData);
    let display_list = document.getElementById("display_list");
    display_list.innerHTML = "";
    let url;
    if (window.innerWidth <= 970) {
        url = "../api/mobile.html?id=";
    }
    else {
        url = "../product/index.html?id=";
    }
    for (let key of Object.keys(bidsData)) {
        console.log(bidsData[key]);
        const productId = key; // 替換成實際的產品 ID
        console.log(productId);
        // 使用 doc 函數構建該產品的參考路徑
        const productRef = doc(db, "products", productId);

        // 使用 getDoc 函數取得該產品的文件快照
        getDoc(productRef)
        .then(async (productDoc) => {
            if (productDoc.exists()) {
                // 取得該產品的資料
                const productData = productDoc.data();
                const productName = productData.name.split('#')[0];
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
                        display_list.innerHTML += '<div class="product" id="' + productId + '"><a href="' + url + productId + '"><img src="' + productData.imgs[0] + '" alt="product"></a><h3>' + productName + '</h3><p>結標時間：<a class="price">' + endDate.toLocaleString() + '</a></p><p>目前競價：<a class="price">$' + productData.price + '</a></p><p>您的注金：<a class="price">$' + bidsData[key] + '</a></p><p><button class="btn" type="submit" id="add' + productId + '">加注</button></p><p><button class="btn" type="submit" id="exit' + productId + '">退出</button></p>';
                    }
                    else if (productData.canBid == false) {
                        await updateDoc(doc(db, "users", userId), {
                            ['bids.' + productId]: deleteField()
                        });
                    }
                }
                else if (currentDate >= endDate) {
                    await updateDoc(doc(db, "users", userId), {
                        ['bids.' + productId]: deleteField()
                    });
                }
                console.log("Product data for product with ID", productId, ":", productData);
            }
            else {
                console.log(productId);
                await updateDoc(doc(db, "users", userId), {
                    ['bids.' + productId]: deleteField()
                });
                console.log("Product with ID", productId, "does not exist.");
            }
        })
        .catch((error) => {
            console.error("Error getting product document:", error);
        });
    }
    display_list.removeEventListener("click", handleCheck);
    display_list.addEventListener("click", handleCheck);
};

const start = () => {
    const title = document.getElementById("title");
    onAuthStateChanged(auth, (user) => {
        if (user) {
            title.innerHTML = "競標清單";
            // const userId = "ethan147852369@gmail.com";
            userId = user.email;

            // 使用 doc 函數構建該使用者的參考路徑
            const userRef = doc(db, "users", userId);

            // 使用 getDoc 函數取得該使用者的文件快照
            getDoc(userRef)
            .then((userDoc) => {
                if (userDoc.exists()) {
                    // 取得該使用者的資料
                    const userData = userDoc.data();

                    // 確認該使用者是否有 cart 資料
                    if (userData && userData.bids) {
                        bidsData = userData.bids;
                        console.log("Bids data for user with ID", userId, ":", bidsData);
                    }
                    else {
                        console.log("User with ID", userId, "does not have bids data.");
                    }
                }
                else {
                    console.log("User with ID", userId, "does not exist.");
                }
                start1();
            })
            .catch((error) => {
                console.error("Error getting user document:", error);
            });
        }
        else {
            userId = undefined;
            title.innerHTML = "請先登入後再來查看";
        }
    });
    const user = auth.currentUser;
    console.log(user);
};

window.addEventListener("load", start);
