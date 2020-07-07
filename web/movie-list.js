

function handleMovieListResult(resultData) {
    console.log(resultData);
    const tableBody = document.querySelector("#movie-table-body");

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

fetch("api/movie-list")
    .then(response => response.json())
    .then(data => handleMovieListResult(data));
