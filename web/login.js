let loginForm = $("#login_form");

function handleLoginResult(resultData) {
    console.log(resultData);
    let jsonResult = JSON.parse(resultData);
    console.log(jsonResult);
    if (jsonResult["login-status"] === "success") {
        window.location.replace("index.html");
    } else {
        let errorMessageDiv = document.querySelector("#error-message");
        errorMessageDiv.innerHTML = jsonResult["message"];
    }
}

function submitLoginForm(event) {

    event.preventDefault();

    $.ajax(
        "api/login", {
            method: "POST",
            // Serialize the login form to the data sent by POST request
            data: loginForm.serialize(),
            success: handleLoginResult
        }
    );
}

loginForm.submit(submitLoginForm);