function getParameterByName(target) {
    // Get request URL
    let url = window.location.href;
    // Encode target parameter name to url encoding
    target = target.replace(/[\[\]]/g, "\\$&");

    // Ues regular expression to find matched parameter value
    let regex = new RegExp("[?&]" + target + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';

    // Return the decoded parameter value
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function buildSearchSQL(title, year, director, star) {
    let sqlQuery = 'select * from movies where '

    const conditions = []

    if (title !== '' && title !== null) {
        conditions.push(`lower(title) like lower('%${title}%')`);
    }
    if (year !== '' && year !== null) {
        conditions.push(`year=${year}`);
    }
    if (director !== '' && director !== null) {
        conditions.push(`lower(director) like lower('%${director}%')`);
    }
    if (star !== '' && star !== null) {
        conditions.push(`id in (select movieId from stars_in_movies where starId in (select id from stars where lower(name) like lower('%${star}%')))`);
    }

    sqlQuery += conditions.join(' and ') + ';';

    return sqlQuery;
}

function buildBrowseGenreSQL(genreId) {
    return `select * from movies where id in (select movieId from genres_in_movies where genreId = ${genreId});`;
}

function buildBrowseTitleSQL(startingChar) {
    if (startingChar === '*') {
        return `select * from movies where lower(title) regexp '^[^a-zA-Z0-9\s].*$';`;
    }
    return `select * from movies where lower(title) like '${startingChar}%' limit 25 offset 0;`;
}

function handleMovieListResult(resultData) {
    console.log(resultData);
    const movieListBoxEl = document.querySelector('.movie-list-box');

    resultData.forEach((movieData) => {

        movieData.movie_stars.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        }).sort((a, b) => { // sort by desc
            if (a.starringNum < b.starringNum) return 1;
            if (a.starringNum > b.starringNum) return -1;
            return 0;
        });



        const movieItemEl = document.createElement('div')
        movieItemEl.className = 'movie-item';
        movieItemEl.innerHTML =
            `
            <div class="row">
                <div class="col title-box">
                        <h4 id="title-year"></h4>
                        <h6 id="movie-director">Directed by <span id="director"></span></h6>
                </div>
                <div class="col rating-box"><h4 id="rating"><span id="rating-value"></span> Rating</h4></div>
                <div class="col genre-box">
                    <h4>Genres</h4>
                    <ul class="short-list" id="genre-list"></ul>
                </div>
                <div class="col star-box">
                    <h4>Stars</h4>
                    <ul class="short-list" id="star-list"></ul>
                </div>
            </div>
        `;

        movieItemEl.querySelector('#title-year').innerHTML = `<a class="title-link" href="single-movie.html?id=${movieData.movie_id}">${movieData.movie_title}</a> (${movieData.movie_year})`;
        movieItemEl.querySelector('#director').textContent = `${movieData.movie_director}`;
        movieItemEl.querySelector('#rating-value').textContent = `${movieData.rating}`;
        
        // displaying first 3 genres sorted by alphabet
        const genreListEl = movieItemEl.querySelector('#genre-list');
        let i = 0;
        while (i < movieData.movie_genres.length) {
            if (i >= 3) break;
            const genreItemEl = document.createElement('li');
            genreItemEl.className = 'genre-item';
            genreItemEl.innerHTML = 
                `<a class="genre-link" href="movie-list.html?browse=1&genre=1&id=${movieData.movie_genres[i].id}">${movieData.movie_genres[i].name}</a>`;
            genreListEl.appendChild(genreItemEl);
            i++;
        }

        //displaying first 3 stars sorted by starring num relative to alphabet
        const starListEl = movieItemEl.querySelector('#star-list');
        i = 0;
        while (i < movieData.movie_stars.length) {
            if (i >= 3) break;
            const starItemEl = document.createElement('li');
            starItemEl.className = 'star-item';
            starItemEl.innerHTML = 
                `<a class="star-link" href="single-star.html?id=${movieData.movie_stars[i].id}">${movieData.movie_stars[i].name}</a>`;
            starListEl.appendChild(starItemEl);
            i++;
        }

        movieListBoxEl.appendChild(movieItemEl);
    })
}

function updateDropdownButtonText(e) {
    let value = e.target.textContent;
    if (value.includes('(')) {
        value = value.split(' ')[0]
    }
    e.target.parentElement.previousElementSibling.textContent = value
    
}

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', updateDropdownButtonText);
})

let sqlQuery = null;
let sortByOption = 'titleThenRating'; // 
let sortOrderOption = 'highToLow';


if (getParameterByName('browse')) {
    if (getParameterByName('genre')) {
        const genreId = getParameterByName('id');
        console.log(genreId);
        sqlQuery = buildBrowseGenreSQL(genreId)
    } else {
        const startingAlphanum = getParameterByName('title');
        console.log(startingAlphanum);
        sqlQuery = buildBrowseTitleSQL(startingAlphanum);
    }

} else {
    const title = getParameterByName('title');
    const year = getParameterByName('year');
    const director = getParameterByName('director');
    const star = getParameterByName('star');

    console.log(title, year, director, star);

    sqlQuery = buildSearchSQL(title, year, director, star);
}


console.log(sqlQuery);

let url = 'api/movie-list?search-query=' + encodeURIComponent(sqlQuery)

fetch(url)
    .then(response => response.json())
    .then(data => handleMovieListResult(data));