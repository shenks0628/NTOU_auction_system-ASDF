// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs, query, where, orderBy, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

async function getProduct(id) {
    const docSnap = await getDoc(doc(db, "products", id));
    if (docSnap.exists()) {
        const data = docSnap.data();
        const imgs = data.imgs;
        const comments = data.comment;
        const seller = data.seller;
        let btn = '', focus = '', buttonsHTML = '';
        if (auth.currentUser && data.seller === auth.currentUser.email) {
            btn = '<button><img src="img/pen.png" alt="edit"></button><button><img src="img/minus.png" alt="remove"></button>';
        } else if (data.quantity <= 0) {
            btn = `<button disabled><img src="img/out-of-stock.png" alt="ban"></button>`;
        } else if (data.endtime) {
            const currentDate = new Date();
            let endDate = data.endtime.toDate();
            if (data.bids_info.modtime) {
                const tmpDate = data.bids_info.modtime.toDate();
                tmpDate.setHours(tmpDate.getHours() + 8);
                if (tmpDate < endDate)
                    endDate = tmpDate;
            }
            if (currentDate > endDate)
                btn = `<button disabled><img src="img/out-of-stock.png" alt="ban"></button>`;
            else
                btn = `<button><img src="img/auction.png" alt="auction"></button>`;
        } else {
            btn = `<button><img src="img/add-cart.png" alt="add-cart"></button>`;
        }
        if (data.endtime) {
            let endDate = data.endtime.toDate();
            if (data.bids_info.modtime) {
                const tmpDate = data.bids_info.modtime.toDate();
                tmpDate.setHours(tmpDate.getHours() + 8);
                if (tmpDate < endDate)
                    endDate = tmpDate;
            }
            focus = 'Expiration date: ' + endDate.toLocaleString();
        } else {
            focus = data.quantity + ' pieces available';
        }
        imgs.forEach((img) => {
            buttonsHTML += `<button class="product-button"><img src="${img}" alt="product-image"></button>`;
        });
        let commentsHTML = Object.keys(comments).length == 0 ? '尚無評論' : '';
        for (let key in comments) {
            commentsHTML += `
                <div class="comment">
                    <a href="index.html?email=${key}"><img src="${await getAvatar(key)}" alt="comment-avatar"></a>
                    <div class="content">
                        <div class="score">${'⭐'.repeat(comments[key][0])}</div>
                        <div class="text">${comments[key].substr(1)}</div>
                    </div>
                </div>
            `;
        }
        productImg.src = imgs[0];
        productSmallImg.src = imgs[0];
        productImgsDiv.innerHTML = buttonsHTML;
        detailDiv.innerHTML = `
            <div><h3>${data.name.split('#')[0]}</h3><p>$${data.price}</p></div>
            <a href="index.html?email=${seller}"><img class="seller-avatar" src="${await getAvatar(seller)}" alt="seller-avatar"></a>
        `;
        detailSmallDiv.innerHTML = `
            <div class="contents">
                <p class="name">${data.name.split('#')[0]}</p>
                <p class="price">$${data.price} <span class="focus">${focus}</span></p>
            </div>
            <div class="buttons">${btn}</div>
        `;
        descriptionSpan.innerHTML = data.description;
        commentsSpan.innerHTML = commentsHTML;

        const productBtns = document.querySelectorAll('.product-button');
        productBtns[0].classList.add('choose');
        productBtns.forEach(button => {
            button.addEventListener('click', () => {
                productImg.src = button.querySelector('img').src;
                productBtns.forEach(btn => {
                    btn.classList.remove('choose');
                });
                button.classList.add('choose');
            });
        });

        detailSmallDiv.onclick = async function (e) {
            if (!e.target.closest('button')) {
                window.location.href = 'mobile.html?id=' + id;
            } else {
                if (e.target.alt === 'edit') {
                    window.location.href = '../edit/?id=' + id;
                } else if (e.target.alt === 'remove') {
                    if (confirm('確定要刪除嗎')) {
                        await deleteDoc(doc(db, "products", id));
                        location.reload();
                    }
                } else {
                    if (data.type == 'bids')
                        addBids(id);
                    else
                        addCart(id);
                }
            }
        }

        const userSnap = await getDoc(doc(db, "users", auth.currentUser.email));
        if (userSnap.exists()) {
            const userData = userSnap.data();
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
                updateDoc(doc(db, "users", auth.currentUser.email), {
                    view: viewarr
                });
            }
        }
    }
}

async function addCart(id) {
    if (auth.currentUser) {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.email));
        const cart = userSnap.data().cart ? userSnap.data().cart : {};
        const productSnap = await getDoc(doc(db, "products", id));
        const num = window.prompt("選擇數量:");
        if (num || num == "") {
            if (!(/^[1-9]+$/.test(num))) {
                window.alert("無效數量！");
            } else {
                cart[id] = cart.hasOwnProperty(id) ? cart[id] + parseInt(num) : parseInt(num);
                if (cart[id] > productSnap.data().quantity) {
                    window.alert("已達庫存上限！");
                } else {
                    await updateDoc(doc(db, "users", auth.currentUser.email), { cart: cart });
                    window.alert("加入成功！");
                }
            }
        }
    } else { window.alert("請先登入帳號！"); }
}
function addBids(docId) {
    if (auth.currentUser) {
        const userId = auth.currentUser.email;
        const productRef = doc(db, "products", docId);
        getDoc(productRef).then(async (productDoc) => {
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
                                    const docSnap = await getDoc(doc(db, "users", userId));
                                    if (docSnap.exists() && parseInt(price) < parseInt(docSnap.data().bids[docId])) {
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
                                    window.location.href = window.location.href;
                                }
                            }
                        }
                    }
                } else {
                    window.alert("此商品已結標！");
                    window.location.href = window.location.href;
                }
            }
        }).catch((error) => {});
    } else { window.alert("請先登入帳號！"); }
}
async function getAvatar(email) {
    try {
        const userSnap = await getDoc(doc(db, "users", email));
        return userSnap.data().imgSrc;
    } catch (error) { return 'img/ASDF.jpg'; }
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
    getProduct(urlParams.get('id'));
}