console.log(window.location.href);
let baseQuery = buildBaseSQLQuery();

let firstItem = getParameterByName('firstItem') || "0"
let itemDisplayNum = getParameterByName('numItem') || "25";
let sortBy = getParameterByName('sortBy') || 'title';
let sortOrder = getParameterByName('sortOrder') || 'lowToHigh';

console.log(firstItem, itemDisplayNum, sortBy, sortOrder);

let movieData = undefined
retrieveMovieData(baseQuery, sortBy, sortOrder).then((result) => {
    movieData = result;
    handleMovieDataResult(movieData, firstItem, itemDisplayNum);
});

document.querySelector('#sort-by-btn').textContent = sortBy === 'title' ? 'Title (then Rating)' : 'Rating (then Title)'
document.querySelector('#sort-order-btn').textContent = sortOrder === 'lowToHigh' ? 'low to high' : 'high to low';
document.querySelector('#num-display-btn').textContent = itemDisplayNum;

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        let value = e.target.textContent;
        if (value.includes('(')) {
            value = value.split(' ')[0]
        }
        e.target.parentElement.previousElementSibling.textContent = value

    });
})

document.querySelectorAll('.sort-by-option').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        sortBy = e.target.textContent.split(' ')[0].toLowerCase();
        console.log(sortBy, sortOrder);
        let url = window.location.href.split('&sortBy')[0] + `&sortBy=${sortBy}&sortOrder=${sortOrder}&firstItem=${firstItem}&numItem=${itemDisplayNum}`
        window.location.replace(url)
    })
})

document.querySelectorAll('.sort-order-option').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        sortOrder = e.target.textContent.startsWith('high') ? 'highToLow': 'lowToHigh';
        console.log(sortBy, sortOrder);
        let url = window.location.href.split('&sortBy')[0] + `&sortBy=${sortBy}&sortOrder=${sortOrder}&firstItem=${firstItem}&numItem=${itemDisplayNum}`
        window.location.replace(url)
    })
})
console.log(window.location);
console.log(window.location.href);
