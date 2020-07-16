let loginForm = $("#login_form");

function handleLoginResult(resultData) {
    console.log(resultData);
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