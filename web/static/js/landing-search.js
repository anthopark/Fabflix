document.querySelector('#search-form').addEventListener('submit', handleSearchSubmit);
const messageEl = document.querySelector('#search-form-message');

function handleSearchSubmit(e) {
    e.preventDefault();

    messageEl.textContent = '';

    const titleVal = document.querySelector('#movie-title').value;
    const yearVal = document.querySelector('#movie-year').value;
    const directorVal = document.querySelector('#movie-director').value;
    const starVal = document.querySelector('#movie-star').value;

    console.log(titleVal, yearVal, directorVal, starVal);

    if (!isValidateSearchInput(titleVal, yearVal, directorVal, starVal)) {
        messageEl.textContent = 'Please fill out at least one input for searching'
        return
    }

    let url = buildURLWithParams(titleVal, yearVal, directorVal, starVal);
    console.log(url);
    url = url + '&sortBy=rating&sortOrder=highToLow&firstItem=0&numItem=25'
    window.location.replace(url);
}

function buildURLWithParams(title, year, director, star) {
    let url = 'movie-list.html?'
    params = []

    if (title !== '') {
        params.push(`title=${encodeURIComponent(title)}`);
    }
    if (year !== '') {
        params.push(`year=${encodeURIComponent(year)}`);
    }
    if (director !== '') {
        params.push(`director=${encodeURIComponent(director)}`);
    }
    if (star !== '') {
        params.push(`star=${encodeURIComponent(star)}`);
    }

    return url + params.join('&');
}

function isValidateSearchInput(title, year, director, star) {
    return !(title === '' && year === '' && director === '' && star === '');
}