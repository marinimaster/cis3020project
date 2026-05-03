const currentUrl = window.location.search;
const params = new URLSearchParams(currentUrl);
const loginForm = document.getElementById('login-form');
const studentCountTag = document.getElementById('student-count');
const loginRoleSelect = document.getElementById('login-role');
const loginTitle = document.getElementById('login-title');
const headerSubtitle = document.getElementById('header-subtitle');
const errorMessage = document.getElementById('error-message');
const balanceTag = document.getElementById('card-balance');
const revenueTag = document.getElementById('revenue');
const createUserForm = document.getElementById('create-user-form');
const paymentForm = document.getElementById('payment-form');
const paidTag = document.getElementById('payment-received');
const userIdTag = document.getElementById('user-id');

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
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(paymentForm);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch("/api/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json " },
                body: JSON.stringify(data)
            });
            const paymentMade = await response.json();

            paidTag.textContent = paymentMade;

        });
    };

    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(createUserForm);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch("/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            console.log(await response.json());
        });
    }

    if (userIdTag) {
        try {
            const response = await fetch('/api/id', {
                method: 'GET',
                credentials: 'include'
            });

            const id = await response.json();
            userIdTag.textContent = id;

        } catch {
            userIdTag.textContent = 'Unavailable';
        }
    }

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

document.addEventListener('DOMContentLoaded', async () => {
    if (balanceTag) {
        try {
            const response = await fetch('/api/balance', {
                method: 'GET',
                credentials: 'include'
            });

            const balance = await response.json();
            balanceTag.textContent = balance;

        } catch {
            balanceTag.textContent = 'Unavailable';
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    if (revenueTag) {
        try {
            const response = await fetch('/api/admin/revenue', {
                method: 'GET',
                credentials: 'include'
            });

            const revenue = await response.json();
            revenueTag.textContent = revenue;

        } catch {
            revenueTag.textContent = 'Unavailable';
        }
    }
});

const error = params.get('error');

if (error && errorMessage) {
    errorMessage.textContent = "Invalid Credentials";
}
