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
    const movieTitle = document.querySelector("#movie-title");
    const movieInfo = document.querySelector("#movie-info");
    const genreList = document.querySelector("#genre-list");
    const starList = document.querySelector("#star-list");

    movieTitle.textContent = movieData[0].movie_title;
    movieInfo.innerHTML = `
        <p>Year: ${movieData[0].movie_year}</p>
        <p>Director: ${movieData[0].movie_director}</p>
        <p>Rating: ${movieData[0].rating}</p>
    `;

    movieData[0].genres.forEach(g => {
        let li = document.createElement('li');
        li.innerHTML = g.name;
        genreList.appendChild(li);
    });

    movieData[0].stars.forEach(s => {
        let li = document.createElement('li');
        li.innerHTML = `<a href="single-star.html?id=${s.id}">${s.name}</a>`;
        starList.appendChild(li);
    });


}

let movieId = getParameterByName("id");

fetch(`api/single-movie?id=${movieId}`)
    .then(response => response.json())
    .then(data => handleSingleMovieResult(data));