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
    let sqlQuery = 'select * from movies inner join (select * from ratings) as r on id = r.movieId where '

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

    sqlQuery += conditions.join(' and ');

    return sqlQuery;
}

function buildBrowseGenreSQL(genreId) {
    return `select * from movies inner join (select * from ratings) as r on id = r.movieId where id in (select movieId from genres_in_movies where genreId = ${genreId})`;
}

function buildBrowseTitleSQL(startingChar) {
    if (startingChar === '*') {
        return `select * from movies inner join (select * from ratings) as r on id = r.movieId where lower(title) regexp '^[^a-zA-Z0-9\s].*$'`;
    }
    return `select * from movies inner join (select * from ratings) as r on id = r.movieId where lower(title) like '${startingChar}%'`;
}

function handleMovieDataResult(resultData, sortBy, sortOrder, numItem, currentPage, recordOffset) {
    numItem = parseInt(numItem);
    const movieDataNum = resultData.length;
    const movieListBoxEl = document.querySelector('.movie-list-box');

    const startIndex = ((currentPage - 1) * numItem) - recordOffset;
    const endIndex = (currentPage * numItem) - recordOffset;

    breakTieSorting(resultData, sortBy, sortOrder);

    console.log(movieDataNum, startIndex, endIndex);
    movieListBoxEl.innerHTML = '';
    for (let i = startIndex; i < endIndex; ++i) {
        if (i >= movieDataNum) return;
        
        starringNameSorting(resultData[i]);

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

        movieItemEl.querySelector('#title-year').innerHTML = `<a class="title-link" href="single-movie.html?id=${resultData[i].movieId}">${resultData[i].movieTitle}</a> (${resultData[i].movieYear})`;
        movieItemEl.querySelector('#director').textContent = `${resultData[i].movieDirector}`;
        movieItemEl.querySelector('#rating-value').textContent = `${resultData[i].movieRating}`;

        // displaying first 3 genres sorted by alphabet
        const genreListEl = movieItemEl.querySelector('#genre-list');
        let k = 0;
        while (k < resultData[i].movieGenres.length) {
            if (k >= 3) break;
            const genreItemEl = document.createElement('li');
            genreItemEl.className = 'genre-item';
            genreItemEl.innerHTML =
                `<a class="genre-link" href="movie-list.html?browse=1&genre=1&id=${resultData[i].movieGenres[k].id}">${resultData[i].movieGenres[k].name}</a>`;
            genreListEl.appendChild(genreItemEl);
            k++;
        }

        //displaying first 3 stars sorted by starring num relative to alphabet
        const starListEl = movieItemEl.querySelector('#star-list');
        k = 0;
        while (k < resultData[i].movieStars.length) {
            if (k >= 3) break;
            const starItemEl = document.createElement('li');
            starItemEl.className = 'star-item';
            starItemEl.innerHTML =
                `<a class="star-link" href="single-star.html?id=${resultData[i].movieStars[k].id}">${resultData[i].movieStars[k].name}</a>`;
            starListEl.appendChild(starItemEl);
            k++;
        }

        movieListBoxEl.appendChild(movieItemEl);   
    }
}


function breakTieSorting(resultData, sortBy, sortOrder) {
    if (sortBy === 'title') {
        if (sortOrder.startsWith('high')) {
            // descending order
            resultData.sort((movie1, movie2) => {
                if (movie1.movieTitle > movie2.movieTitle) return -1;
                if (movie1.movieTitle < movie2.movieTitle) return 1;

                if (movie1.movieRating > movie2.movieRating) return -1;
                if (movie1.movieRating < movie2.movieRating) return 1;
            })
        } else {
            // ascending order
            resultData.sort((movie1, movie2) => {
                if (movie1.movieTitle > movie2.movieTitle) return 1;
                if (movie1.movieTitle < movie2.movieTitle) return -1;

                if (movie1.movieRating > movie2.movieRating) return 1;
                if (movie1.movieRating < movie2.movieRating) return -1;
            })

        }
    } else {
        if (sortOrder.startsWith('high')) {
            // descending order
            resultData.sort((movie1, movie2) => {
                if (movie1.movieRating > movie2.movieRating) return -1;
                if (movie1.movieRating < movie2.movieRating) return 1;

                if (movie1.movieTitle > movie2.movieTitle) return -1;
                if (movie1.movieTitle < movie2.movieTitle) return 1;
            })
        } else {
            // ascending order
            resultData.sort((movie1, movie2) => {
                if (movie1.movieRating > movie2.movieRating) return 1;
                if (movie1.movieRating < movie2.movieRating) return -1;

                if (movie1.movieTitle > movie2.movieTitle) return 1;
                if (movie1.movieTitle < movie2.movieTitle) return -1;
            })
            
        }
    }
}

function starringNameSorting(movieData) {
    movieData.movieStars.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    }).sort((a, b) => { // sort by desc
        if (a.starringNum < b.starringNum) return 1;
        if (a.starringNum > b.starringNum) return -1;
        return 0;
    });
}



function buildBaseSQLQuery() {
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

        sqlQuery = buildSearchSQL(title, year, director, star);
    }

    return sqlQuery;
}


function updatePageInfo(currentPage) {
    document.querySelector('#page-num').textContent = currentPage;
}


function updateFirstPageNextButtonStatus(numItem, movieDataNum) {
    if (movieDataNum <= numItem) {
        document.querySelector('#next-btn').classList.add('disabled');
    } else {
        document.querySelector('#next-btn').classList.remove('disabled');
    }
}


async function retrieveMovieData(baseQuery, sortBy, sortOrder, limit, offset) {
    completeQuery = baseQuery +
        ` order by ${sortBy} ${sortOrder === 'lowToHigh' ? 'asc' : 'desc'} limit ${limit} offset ${offset};`
    
    const response = await fetch('api/movie-list?search-query=' + encodeURIComponent(completeQuery));
    const movieData = await response.json();
    return movieData
}