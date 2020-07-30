function handleSessionData(resultData) {
    if (resultData["userEmail"]) {
        let greeting = document.querySelector("#greeting");
        greeting.innerHTML = `Hello, ${resultData["userEmail"]}`;
    }
}

function redirectToLogin(data) {
    if (data["status"] === "success") {
        window.location.replace("login.html");
    } else {
        console.log("Logout failed");
    }
}

fetch("api/index")
    .then(response => response.json())
    .then(data => handleSessionData(data));

let logoutForm = document.querySelector("#logout_form");

logoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    fetch("api/logout")
        .then(response => response.json())
        .then(data => redirectToLogin(data));
})