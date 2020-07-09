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

function handleSingleStarResult(starData) {
    console.log(starData);
    const starName = document.querySelector("#star-name");
    const starInfo = document.querySelector("#star-info");
    const movieList = document.querySelector("#movie-list");

    starName.innerHTML = starData[0].star_name;
    starInfo.innerHTML = `
        <p>Birth Year: ${starData[0].star_birthYear ? starData[0].star_birthYear: "N/A"}</p>
    `;

    starData[0].movies.forEach(m => {
        let li = document.createElement("li");
        li.innerHTML = `<a href="single-movie.html?id=${m.id}">${m.title}</a>`
        movieList.appendChild(li);
    });
}


let starId = getParameterByName("id");

fetch(`api/single-star?id=${starId}`)
    .then(response => response.json())
    .then(data => handleSingleStarResult(data));