const urlParams = new URLSearchParams(window.location.search);
const keywords = urlParams.get('search') ? urlParams.get('search') : '';
let timeSort = '', priceSort = '';
if (!localStorage.getItem('ASDF-display') || localStorage.getItem('ASDF-display') !== 'list') {
    productContainer.className = '';
    displayBtn.innerHTML = '<img src="img/list.png">';
    localStorage.setItem('ASDF-display', 'menu');
} else {
    productContainer.className = 'row';
    displayBtn.innerHTML = '<img src="img/menu.png">';
    localStorage.setItem('ASDF-display', 'list');
}
if (urlParams.get('type')) {
    const type = urlParams.get('type');
    if (type === 'auction') productType.value = 'bids';
    if (type === 'general') productType.value = 'normal';
}

displayBtn.onclick = function (e) {
    if (localStorage.getItem('ASDF-display') !== 'list') {
        productContainer.className = 'row';
        displayBtn.innerHTML = '<img src="img/menu.png">';
        localStorage.setItem('ASDF-display', 'list');
    } else {
        productContainer.className = '';
        displayBtn.innerHTML = '<img src="img/list.png">';
        localStorage.setItem('ASDF-display', 'menu');
    }
}