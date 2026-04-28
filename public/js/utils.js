// =============================================
// SPMS — Shared Utility Functions
// Used across all frontend pages
// =============================================

const API_BASE = '';

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {'success'|'error'|'info'} type - Toast type
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
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

/**
 * Escape HTML to prevent XSS
 * @param {string} str - Raw string
 * @returns {string} Escaped HTML string
 */
function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Open a modal by ID
 * @param {string} id - Modal element ID
 */
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

/**
 * Close a modal by ID
 * @param {string} id - Modal element ID
 */
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

/**
 * Initialize modal overlay click-to-dismiss behavior
 */
function initModalOverlays() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });
}

/**
 * Logout the current user
 */
async function logout() {
    await fetch(`${API_BASE}/api/auth/logout`, { credentials: 'include' });
    window.location.href = '/';
}
