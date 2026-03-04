const currentUrl = window.location.search; //returns string: '?error=invalid-credentials'
const params = new URLSearchParams(currentUrl);
const loginForm = document.getElementById('login-form');
const studentCountTag = document.getElementById('student-count');

document.addEventListener('DOMContentLoaded', async () => {
    if (studentCountTag) {

        const response = await fetch('/api/students', {
            method: 'GET',
            credentials: 'include'
        });

        const studentCount = await response.json()
        studentCountTag.textContent = studentCount;
    };
});

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('/api/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            return console.log(await response.text());
        }

        window.location.href = '/dashboard';
    });
}

const error = params.get('error');

if (error) {
    document.getElementById('error-message').textContent =
        "Invalid Credentials";
};