const mainElement = document.querySelector('main');
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('path')) {
    toUrl(urlParams.get('path'));
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
function toUrl(url) {
    mainIframe.src = '../' + url;
}
function toggleDropdown() {
    dropdown.style.display = dropdown.style.display !== "block" ? "block" : "none";
}