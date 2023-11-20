const mainElement = document.querySelector('main');
const urlParams = new URLSearchParams(window.location.search);
const keywords = urlParams.get('search') ? urlParams.get('search') : '';
if (!localStorage.getItem('ASDF-display')) {
    localStorage.setItem('ASDF-display', 'menu');
}
function searchProducts() {
    window.location.href = '?search=' + searchInput.value;
}
function searchProduct(id) {
    window.location.href = '?id=' + id;
}
function searchUser(email) {
    window.location.href = '?email=' + email;
}