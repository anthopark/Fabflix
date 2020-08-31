console.log(window.location.href);

let baseQuery = buildBaseSQLQuery();

let firstItem = getParameterByName('firstItem') || "0"
let numItem = getParameterByName('numItem') || "25";
let sortBy = getParameterByName('sortBy') || 'title';
let sortOrder = getParameterByName('sortOrder') || 'lowToHigh';

let currentPage = 1;
let lastPage;
let firstPage = 0;

let recordLimit = 300;
let recordOffset = 0;

let nextRetrievePage;
let prevRetrievePage;

let movieData;
let movieDataNum;

retrieveMovieData(baseQuery, sortBy, sortOrder, recordLimit, recordOffset).then((result) => {
    movieData = result;
    movieDataNum = result.length;
    lastPage = Math.ceil((movieDataNum + recordOffset) / parseInt(numItem));
    updatePageInfo(currentPage);
    updateFirstPageNextButtonStatus(numItem, movieDataNum);
    handleMovieDataResult(movieData, sortBy, sortOrder, numItem, currentPage, recordOffset);
});



document.querySelector('#sort-by-btn').textContent = sortBy === 'title' ? 'Title' : 'Rating'
document.querySelector('#sort-order-btn').textContent = sortOrder === 'lowToHigh' ? 'low to high' : 'high to low';
document.querySelector('#num-display-btn').textContent = numItem;

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
        let url = window.location.href.split('&sortBy')[0] + `&sortBy=${sortBy}&sortOrder=${sortOrder}&firstItem=${firstItem}&numItem=${numItem}`
        window.location.replace(url)
    })
})

document.querySelectorAll('.sort-order-option').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        sortOrder = e.target.textContent.startsWith('high') ? 'highToLow': 'lowToHigh';
        console.log(sortBy, sortOrder);
        let url = window.location.href.split('&sortBy')[0] + `&sortBy=${sortBy}&sortOrder=${sortOrder}&firstItem=${firstItem}&numItem=${numItem}`
        window.location.replace(url)
    })
})

document.querySelectorAll('.num-display').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        numItem = e.target.textContent;
        currentPage = 1;
        firstPage = 0;
        recordOffset = 0;

        retrieveMovieData(baseQuery, sortBy, sortOrder, recordLimit, recordOffset).then((result) => {
            movieData = result;
            movieDataNum = result.length;
            lastPage = Math.ceil((movieDataNum + recordOffset) / parseInt(numItem));
            updatePageInfo(currentPage);
            updateFirstPageNextButtonStatus(numItem, movieDataNum);
            handleMovieDataResult(movieData, sortBy, sortOrder, numItem, currentPage, recordOffset);
        });
    })
})

document.querySelector('#prev-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('disabled')) return;
    const nextButtonEl = document.querySelector('#next-btn');
    
    currentPage -= 1;

    updatePageInfo(currentPage);

    if (currentPage > firstPage) {
        // display with current movie data
        handleMovieDataResult(movieData, sortBy, sortOrder, numItem, currentPage, recordOffset)
        if (currentPage === 1) {
            e.target.classList.add('disabled');
        }
    } else if (currentPage === firstPage && firstPage !== 0) {
        // retrieve previous batch
        recordOffset -= 300;
        firstPage -= recordLimit / parseInt(numItem);
        retrieveMovieData(baseQuery, sortBy, sortOrder, recordLimit, recordOffset).then((result) => {
            movieData = result;
            movieDataNum = result.length;
            lastPage = Math.ceil((movieDataNum + recordOffset) / parseInt(numItem));
            updatePageInfo(currentPage);
            updateFirstPageNextButtonStatus(numItem, movieDataNum);
            handleMovieDataResult(movieData, sortBy, sortOrder, numItem, currentPage, recordOffset);
        });
    }

    if (currentPage < lastPage && nextButtonEl.classList.contains('disabled')) {
        nextButtonEl.classList.remove('disabled');
    }
    console.log(`curr p: ${currentPage}, first p: ${firstPage}, last p: ${lastPage}`);
})

document.querySelector('#next-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('disabled')) return;
    const prevButtonEl = document.querySelector('#prev-btn');
    
    currentPage += 1;

    if (currentPage !== 1) {
        prevButtonEl.classList.remove('disabled');
    }
    
    updatePageInfo(currentPage);
    
    if (currentPage <= lastPage) {
        // display with current movie data
        handleMovieDataResult(movieData, sortBy, sortOrder, numItem, currentPage, recordOffset)
        if (currentPage === lastPage && movieDataNum !== recordLimit) {
            // end of data
            e.target.classList.add('disabled');
        }
    } else if (currentPage === (lastPage + 1) && movieDataNum === recordLimit) {
        // retrieve more data
        recordOffset += recordLimit;
        firstPage += recordLimit / parseInt(numItem);
        retrieveMovieData(baseQuery, sortBy, sortOrder, recordLimit, recordOffset).then((result) => {
            movieData = result;
            movieDataNum = result.length;
            lastPage = Math.ceil((movieDataNum + recordOffset) / parseInt(numItem));
            updatePageInfo(currentPage);
            updateFirstPageNextButtonStatus(numItem, movieDataNum);
            handleMovieDataResult(movieData, sortBy, sortOrder, numItem, currentPage, recordOffset);
        });
    }
    console.log(`curr p: ${currentPage}, first p: ${firstPage}, last p: ${lastPage}`);
})

