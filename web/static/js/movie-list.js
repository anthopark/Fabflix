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
    const tableBody = document.querySelector("#movie-list-tbody");

    resultData.forEach((movieData, i) => {
        let row = tableBody.insertRow(i);

        let title = row.insertCell(0);
        title.innerHTML =
            `<a href="single-movie.html?id=${movieData.movie_id}">${movieData.movie_title}</a>`;

        let year = row.insertCell(1);
        year.innerHTML = movieData.movie_year;

        let director = row.insertCell(2);
        director.innerHTML = movieData.movie_director;

        let genres = row.insertCell(3);
        genres.innerHTML = movieData.movie_genres.map(g => {
            return g.name;
        }).join(", ");

        let stars = row.insertCell(4);
        stars.innerHTML = movieData.movie_stars.map(s => {
            return `<a href="single-star.html?id=${s.id}">${s.name}</a>`;
        }).join(", ");

        let rating = row.insertCell(5);
        rating.innerHTML = movieData.rating;
    })
}

let sqlQuery = null;

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