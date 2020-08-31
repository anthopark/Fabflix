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

function handleSingleMovieResult(movieData) {
    console.log(movieData);
    const movieTitleEl = document.querySelector("#movie-title");
    const movieYearEl = document.querySelector('#movie-year');
    const movieDirectorEl = document.querySelector('#movie-director');
    const movieRatingEl = document.querySelector('#movie-rating');

    const genreListEl = document.querySelector("#genre-list");
    const starListEl = document.querySelector("#star-list");

    movieTitleEl.textContent = movieData.movieTitle;
    movieYearEl.textContent = ` (${movieData.movieYear})`;
    movieRatingEl.textContent = `⭐ ${movieData.movieRating}`
    movieDirectorEl.textContent = movieData.movieDirector;

    
    movieData.genres.sort((g1, g2) => {
        if (g1.name < g2.name) return -1;
        if (g1.name > g2.name) return 1;
        if (g1.name == g2.name) return 0;
    })

    movieData.genres.forEach(g => {
        let li = document.createElement('li');
        li.innerHTML = 
        `<h5>
            <a href="movie-list.html?browse=1&genre=1&id=${g.id}&sortBy=rating&sortOrder=highToLow&firstItem=0&numItem=25">${g.name}</a>
        </h5>`;
        genreListEl.appendChild(li);
    });

    movieData.stars.sort((s1, s2) => {
        if (s1.starringNum > s2.starringNum) return -1;
        if (s1.starringNum < s2.starringNum) return 1;

        if (s1.name < s2.name) return -1;
        if (s1.name > s2.name) return 1;
    });

    console.log(movieData.stars);

    movieData.stars.forEach(s => {
        let li = document.createElement('li');
        li.innerHTML = 
        `<h5>
            <a href="single-star.html?id=${s.id}">${s.name}</a>
        </h5>`;
        starListEl.appendChild(li);
    });


}

document.querySelector('#prev-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.history.back();
})

let movieId = getParameterByName("id");

fetch(`api/single-movie?id=${movieId}`)
    .then(response => response.json())
    .then(data => handleSingleMovieResult(data));

