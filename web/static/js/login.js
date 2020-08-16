const loginForm = $("#login-form");
loginForm.submit(handleLoginSubmit);

function handleLoginSubmit(e) {


    e.preventDefault();

    $.ajax(
        "api/login", {
            method: "POST",
            // Serialize the login form to the data sent by POST request
            data: loginForm.serialize(),
            success: handleLoginResult
        }
    );

}

function handleLoginResult(responseString) {
    const responseData = JSON.parse(responseString);

    // If login succeeds, it will redirect the user to index.html
    if (responseData["loginStatus"] === "success") {
        console.log('success!');
        window.location.replace("landing.html");
    } else {
        const messageDiv = document.querySelector('#login-message');
        messageDiv.innerHTML = '';

        const messageElem = document.createElement('div');
        messageElem.className = "alert alert-danger";
        messageElem.textContent = responseData["message"];

        messageDiv.appendChild(messageElem);
    }
}