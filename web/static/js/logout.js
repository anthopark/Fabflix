document.querySelector('#logout-btn').addEventListener('click', handleLogout);

function handleLogout(e) {
    fetch('api/logout')
        .then(response => response.json())
        .then(data => handleLogoutResult(data));
    e.preventDefault();
}

function handleLogoutResult(responseData) {
    console.log(responseData);
    if (responseData['status'] === 'success') {
        window.location.replace("login.html");
    }
}