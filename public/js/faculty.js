// =============================================
// Faculty Dashboard JS
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
        if (data.user.role !== 'faculty') { window.location.href = '/'; return; }
        currentUser = data.user;
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
        loadProjects();
    } catch (e) {
        window.location.href = '/';
    }
}

async function logout() {
    await fetch(`${API}/api/auth/logout`, { credentials: 'include' });
    window.location.href = '/';
}

async function loadProjects() {
    try {
        const res = await fetch(`${API}/api/faculty/projects`, { credentials: 'include' });
        const projects = await res.json();
        renderProjects(projects);
        document.getElementById('totalAssigned').textContent = projects.length;
        document.getElementById('pendingReview').textContent = projects.filter(p => p.status === 'pending').length;
        document.getElementById('approvedCount').textContent = projects.filter(p => p.status === 'approved').length;
        document.getElementById('rejectedCount').textContent = projects.filter(p => p.status === 'rejected').length;
    } catch (e) {
        showToast('Failed to load projects.', 'error');
    }
}

function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderProjects(projects) {
    const tbody = document.getElementById('projectsTable');
    if (projects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📂</div><h3>No projects assigned</h3><p>Projects assigned to you will appear here.</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = projects.map(p => `
        <tr>
            <td><strong>${escHtml(p.title)}</strong></td>
            <td>${escHtml(p.student_name)}</td>
            <td>${escHtml(p.student_department || '—')}</td>
            <td>${escHtml(p.technology || '—')}</td>
            <td><span class="badge badge-${p.status}">${p.status}</span></td>
            <td><button class="btn btn-outline btn-sm" onclick='openReview(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Review</button></td>
        </tr>
    `).join('');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function openReview(project) {
    document.getElementById('reviewTitle').textContent = project.title;
    document.getElementById('reviewProjectId').value = project.project_id;
    document.getElementById('reviewFeedback').value = project.feedback || '';

    let html = `
        <div style="margin-bottom:16px">
            <p style="color:var(--text-secondary);font-size:14px;margin-bottom:12px">${escHtml(project.description || 'No description provided.')}</p>
            <div class="d-flex gap-2 flex-wrap items-center">
                <span class="badge badge-${project.status}">${project.status}</span>
                ${project.technology ? `<span style="color:var(--text-muted);font-size:13px">🛠 ${escHtml(project.technology)}</span>` : ''}
                <span style="color:var(--text-muted);font-size:13px">👤 ${escHtml(project.student_name)} (${escHtml(project.student_email)})</span>
            </div>
        </div>
    `;
    document.getElementById('reviewContent').innerHTML = html;

    // Load files
    loadFiles(project.project_id);

    openModal('reviewModal');
}

async function loadFiles(projectId) {
    try {
        const res = await fetch(`${API}/api/faculty/projects/${projectId}/files`, { credentials: 'include' });
        const files = await res.json();
        const container = document.getElementById('reviewFiles');
        if (files.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No files uploaded by student.</p>';
            return;
        }
        container.innerHTML = files.map(f => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:var(--radius-sm);margin-bottom:8px">
                <span style="font-size:14px">📄 ${escHtml(f.file_name)} <span style="font-size:11px;color:var(--text-muted)">${new Date(f.submission_date).toLocaleDateString()}</span></span>
                <a href="/uploads/${f.file_path}" target="_blank" class="btn btn-outline btn-sm">Download</a>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('reviewFiles').innerHTML = '<p style="color:var(--accent-red);font-size:13px">Failed to load files.</p>';
    }
}

async function submitReview(status) {
    const projectId = document.getElementById('reviewProjectId').value;
    const feedback = document.getElementById('reviewFeedback').value.trim();

    try {
        const res = await fetch(`${API}/api/faculty/projects/${projectId}/review`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status, feedback })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`Project ${status}!`, 'success');
            closeModal('reviewModal');
            loadProjects();
        } else {
            showToast(data.error || 'Review failed.', 'error');
        }
    } catch (e) {
        showToast('Network error.', 'error');
    }
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

init();
