// =============================================
// Auth JS — Login & Registration Logic
// =============================================

const API_BASE = '';

// Toast notification system
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Check if user is already logged in
async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            redirectToDashboard(data.user.role);
        }
    } catch (e) {
        // Not logged in, stay on auth page
    }
}

function redirectToDashboard(role) {
    switch (role) {
        case 'student': window.location.href = '/student/dashboard.html'; break;
        case 'faculty': window.location.href = '/faculty/dashboard.html'; break;
        case 'admin': window.location.href = '/admin/dashboard.html'; break;
        default: window.location.href = '/';
    }
}

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    checkAuth();
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.textContent = 'Signing in...';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => redirectToDashboard(data.user.role), 800);
            } else {
                showToast(data.error || 'Login failed.', 'error');
                btn.disabled = false;
                btn.textContent = 'Sign In';
            }
        } catch (err) {
            showToast('Network error. Is the server running?', 'error');
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });
}

// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    checkAuth();
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('registerBtn');
        btn.disabled = true;
        btn.textContent = 'Creating account...';

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            department: document.getElementById('department').value.trim(),
            role: document.getElementById('role').value
        };

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => window.location.href = '/', 1500);
            } else {
                showToast(data.error || 'Registration failed.', 'error');
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        } catch (err) {
            showToast('Network error. Is the server running?', 'error');
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}
