const currentUrl = window.location.search; //returns string: '?error=invalid-credentials'
const params = new URLSearchParams(currentUrl);

const error = params.get('error');

if(error){
    document.getElementById('error-message').textContent =
        "Invalid Credentials";
};