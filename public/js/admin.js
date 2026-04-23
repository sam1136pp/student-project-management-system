// =============================================
// Admin Dashboard JS
// =============================================

const API = '';
let currentUser = null;

function showToast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    t.innerHTML = `<span>${icons[type] || ''}</span> ${msg}`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100px)'; setTimeout(() => t.remove(), 300); }, 3500);
}

async function init() {
    try {
        const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
        if (!res.ok) { window.location.href = '/'; return; }
        const data = await res.json();
        if (data.user.role !== 'admin') { window.location.href = '/'; return; }
        currentUser = data.user;
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
        loadStats();
        loadUsers();
        loadProjects();
        loadFacultyList();
    } catch (e) {
        window.location.href = '/';
    }
}

async function logout() {
    await fetch(`${API}/api/auth/logout`, { credentials: 'include' });
    window.location.href = '/';
}

function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Section navigation
function showSection(section) {
    document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
    document.getElementById(`section-${section}`).style.display = 'block';
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    event.target.closest('a').classList.add('active');
}

// Load stats
async function loadStats() {
    try {
        const res = await fetch(`${API}/api/admin/stats`, { credentials: 'include' });
        const s = await res.json();
        document.getElementById('statStudents').textContent = s.totalStudents;
        document.getElementById('statFaculty').textContent = s.totalFaculty;
        document.getElementById('statProjects').textContent = s.totalProjects;
        document.getElementById('statPending').textContent = s.pendingProjects;
        document.getElementById('statApproved').textContent = s.approvedProjects;
        document.getElementById('statPendingAlt').textContent = s.pendingProjects;
        document.getElementById('statRejected').textContent = s.rejectedProjects;
    } catch (e) {
        showToast('Failed to load stats.', 'error');
    }
}

// Load users
async function loadUsers() {
    try {
        const res = await fetch(`${API}/api/admin/users`, { credentials: 'include' });
        const users = await res.json();
        const tbody = document.getElementById('usersTable');
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:40px;color:var(--text-muted)">No users found.</td></tr>`;
            return;
        }
        tbody.innerHTML = users.map(u => `
            <tr>
                <td><strong>${escHtml(u.name)}</strong></td>
                <td>${escHtml(u.username)}</td>
                <td>${escHtml(u.email)}</td>
                <td><span class="badge badge-${u.role}">${u.role}</span></td>
                <td>${escHtml(u.department || '—')}</td>
                <td>
                    ${u.user_id !== currentUser.user_id ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.user_id}, '${escHtml(u.name)}')">Delete</button>` : '<span style="color:var(--text-muted);font-size:12px">You</span>'}
                </td>
            </tr>
        `).join('');
    } catch (e) {
        showToast('Failed to load users.', 'error');
    }
}

// Delete user
async function deleteUser(userId, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete their projects.`)) return;
    try {
        const res = await fetch(`${API}/api/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
            showToast('User deleted.', 'success');
            loadUsers();
            loadStats();
            loadProjects();
        } else {
            showToast(data.error || 'Failed.', 'error');
        }
    } catch (e) {
        showToast('Network error.', 'error');
    }
}

// Add user
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        name: document.getElementById('newName').value.trim(),
        email: document.getElementById('newEmail').value.trim(),
        username: document.getElementById('newUsername').value.trim(),
        password: document.getElementById('newPassword').value,
        department: document.getElementById('newDepartment').value.trim(),
        role: document.getElementById('newRole').value
    };
    try {
        const res = await fetch(`${API}/api/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
            showToast('User created!', 'success');
            closeModal('addUserModal');
            document.getElementById('addUserForm').reset();
            loadUsers();
            loadStats();
        } else {
            showToast(data.error || 'Failed.', 'error');
        }
    } catch (e) {
        showToast('Network error.', 'error');
    }
});

// Load projects
async function loadProjects() {
    try {
        const res = await fetch(`${API}/api/admin/projects`, { credentials: 'include' });
        const projects = await res.json();
        const tbody = document.getElementById('projectsTable');
        if (projects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:40px;color:var(--text-muted)">No projects found.</td></tr>`;
            return;
        }
        tbody.innerHTML = projects.map(p => `
            <tr>
                <td><strong>${escHtml(p.title)}</strong></td>
                <td>${escHtml(p.student_name)}</td>
                <td>${p.faculty_name ? escHtml(p.faculty_name) : '<span style="color:var(--accent-yellow)">Not assigned</span>'}</td>
                <td>${escHtml(p.technology || '—')}</td>
                <td><span class="badge badge-${p.status}">${p.status}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="openAssignModal(${p.project_id})">Assign Mentor</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        showToast('Failed to load projects.', 'error');
    }
}

// Faculty list for dropdown
async function loadFacultyList() {
    try {
        const res = await fetch(`${API}/api/admin/faculty`, { credentials: 'include' });
        const faculty = await res.json();
        const select = document.getElementById('assignFaculty');
        select.innerHTML = '<option value="">Select a faculty member</option>';
        faculty.forEach(f => {
            select.innerHTML += `<option value="${f.user_id}">${escHtml(f.name)} — ${escHtml(f.department || 'N/A')}</option>`;
        });
    } catch (e) {
        // silent
    }
}

function openAssignModal(projectId) {
    document.getElementById('assignProjectId').value = projectId;
    openModal('assignModal');
}

// Assign mentor
document.getElementById('assignForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectId = document.getElementById('assignProjectId').value;
    const facultyId = document.getElementById('assignFaculty').value;
    if (!facultyId) { showToast('Select a faculty member.', 'error'); return; }

    try {
        const res = await fetch(`${API}/api/admin/projects/${projectId}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ faculty_id: parseInt(facultyId) })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Mentor assigned!', 'success');
            closeModal('assignModal');
            loadProjects();
        } else {
            showToast(data.error || 'Failed.', 'error');
        }
    } catch (e) {
        showToast('Network error.', 'error');
    }
});

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

init();
