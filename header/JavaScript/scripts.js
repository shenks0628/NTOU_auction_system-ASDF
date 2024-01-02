const mainElement = document.querySelector('main');
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('path')) {
    toUrl(window.location.search.split('?path=')[1]);
}
shareBtn.onclick = function () {
    copyPageUrl();
}
menuBtn.onclick = function () {
    dropdown.style.display = "none";
    if (menuBtn.classList.contains('click')) {
        menuBtn.classList.remove('click');
        menuUl.classList.remove('straight');
        menuSearch.classList.remove('straight');
    } else {
        menuBtn.classList.add('click');
        menuUl.classList.add('straight');
        menuSearch.classList.add('straight');
    }
}
searchBarMode.onclick = function () {
    const shop = '<img src="img/shopping-cart.png" alt="search mode">';
    const user = '<img src="img/users.png" alt="search mode">';
    searchBarMode.innerHTML = searchBarMode.innerHTML===user ? shop : user;
}
menuSearchMode.onclick = function () {
    const shop = '<img src="img/shopping-cart.png" alt="search mode">';
    const user = '<img src="img/users.png" alt="search mode">';
    menuSearchMode.innerHTML = menuSearchMode.innerHTML===user ? shop : user;
}
function toUrl(url) {
    mainIframe.src = '../' + url;
}
function contact() {
    window.location.href = "https://discord.gg/qpfvyhBxq7";
}
function toggleDropdown() {
    dropdown.style.display = dropdown.style.display !== "block" ? "block" : "none";
}
function copyPageUrl() {
    const dummy = document.createElement('input');
    const url = new URL(mainIframe.src);
    const text = url.hostname + '/header/?path=' + url.pathname + url.search;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);

    alert("連結已複製！");
}