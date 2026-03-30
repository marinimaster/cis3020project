const currentUrl = window.location.search;
const params = new URLSearchParams(currentUrl);
const loginForm = document.getElementById('login-form');
const studentCountTag = document.getElementById('student-count');
const loginRoleSelect = document.getElementById('login-role');
const loginTitle = document.getElementById('login-title');
const headerSubtitle = document.getElementById('header-subtitle');
const errorMessage = document.getElementById('error-message');

const loginConfig = {
    standard: {
        endpoint: '/api/login/standard',
        redirect: '/dashboard',
        title: 'Standard Login',
        subtitle: 'Standard User Access'
    },
    admin: {
        endpoint: '/api/login/admin',
        redirect: '/admin/dashboard',
        title: 'Admin Login',
        subtitle: 'Administrator Access'
    }
};

function updateLoginMode() {
    if (!loginForm || !loginRoleSelect) {
        return loginConfig.standard;
    }

    const selectedMode = loginConfig[loginRoleSelect.value] || loginConfig.standard;

    loginForm.action = selectedMode.endpoint;

    if (loginTitle) {
        loginTitle.textContent = selectedMode.title;
    }

    if (headerSubtitle) {
        headerSubtitle.textContent = selectedMode.subtitle;
    }

    if (errorMessage) {
        errorMessage.textContent = '';
    }

    return selectedMode;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (studentCountTag) {
        try {
            const response = await fetch('/api/students', {
                method: 'GET',
                credentials: 'include'
            });

            const studentCount = await response.json();
            studentCountTag.textContent = studentCount;
            
        } catch {
            studentCountTag.textContent = 'Unavailable';
        }
    }

    updateLoginMode();
});

if (loginRoleSelect) {
    loginRoleSelect.addEventListener('change', updateLoginMode);
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());
        const selectedMode = updateLoginMode();

        const response = await fetch(selectedMode.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            window.location.href = selectedMode.redirect;
            return;
        }

        if (errorMessage) {
            errorMessage.textContent = 'Invalid Credentials';
        }
    });
}

const error = params.get('error');

if (error && errorMessage) {
    errorMessage.textContent = "Invalid Credentials";
}
