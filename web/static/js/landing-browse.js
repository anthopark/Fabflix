document.querySelector('.genre-unfold-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.title-link-box').style.display = 'none';
    document.querySelector('.genre-link-box').style.display = 'block';
})

document.querySelector('.title-unfold-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.genre-link-box').style.display = 'none';
    document.querySelector('.title-link-box').style.display = 'block';
})

document.querySelectorAll('.collapse-btn').forEach((elem) => {
    elem.addEventListener('click', (e) => {
        e.preventDefault();
        e.target.parentElement.style.display = 'none';
    })
})


fetch('api/landing')
    .then(response => response.json())
    .then(data => handleGenreData(data));


function handleGenreData(data) {
    console.log(typeof data);
    console.log(data);

    const genres = data.genres;
    const genreListEl = document.querySelector('#genre-list')

    genres.forEach((genre) => {
        const genreItemEl = document.createElement('li');
        genreItemEl.className = 'genre-item';
        genreItemEl.innerHTML =
            `<a href="#" id="genre-${genre.genreId}">
                <h5 class="genre-name">${genre.genreName}</h5>
            </a>`;
        genreListEl.appendChild(genreItemEl);
    })
}

document.querySelector('#genre-list').addEventListener('click', (e) => {
    if (e.target.className === 'genre-name') {
        const genreId = e.target.parentElement.id.split('-')[1];
        console.log(genreId);
        // build url
        const url = `movie-list.html?browse=1&genre=1&id=${genreId}`;
        // redirect to movie-list.html
        window.location.replace(url);
    }
})