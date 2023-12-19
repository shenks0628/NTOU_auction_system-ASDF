const urlParams = new URLSearchParams(window.location.search);
const keywords = urlParams.get('search') ? urlParams.get('search') : '';
let timeSort = '', priceSort = '';
if (!localStorage.getItem('ASDF-display')) {
    localStorage.setItem('ASDF-display', 'menu');
}
if (urlParams.get('type')) {
    const type = urlParams.get('type');
    if (type === 'auction') productType.value = 'bids';
    if (type === 'general') productType.value = 'normal';
}

displayBtn.onclick = function (e) {
    if (localStorage.getItem('ASDF-display') !== 'list') {
        productContainer.querySelectorAll('section').forEach((section) => {
            section.className = 'product row';
        });
        displayBtn.innerHTML = '<img src="img/menu.png">';
        localStorage.setItem('ASDF-display', 'list');
    } else {
        productContainer.querySelectorAll('section').forEach((section) => {
            section.className = 'product';
        });
        displayBtn.innerHTML = '<img src="img/list.png">';
        localStorage.setItem('ASDF-display', 'menu');
    }
}
//mobile folder