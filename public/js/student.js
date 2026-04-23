// =============================================
// Student Dashboard JS
// =============================================

const API = '';
let currentUser = null;

// Toast
function showToast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    t.innerHTML = `<span>${icons[type] || ''}</span> ${msg}`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100px)'; setTimeout(() => t.remove(), 300); }, 3500);
}

// Auth check
async function init() {
    try {
        const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
        if (!res.ok) { window.location.href = '/'; return; }
        const data = await res.json();
        if (data.user.role !== 'student') { window.location.href = '/'; return; }
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

// Load projects
async function loadProjects() {
    try {
        const res = await fetch(`${API}/api/student/projects`, { credentials: 'include' });
        const projects = await res.json();
        renderProjects(projects);
        updateStats(projects);
    } catch (e) {
        showToast('Failed to load projects.', 'error');
    }
}

function updateStats(projects) {
    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('approvedCount').textContent = projects.filter(p => p.status === 'approved').length;
    document.getElementById('pendingCount').textContent = projects.filter(p => p.status === 'pending').length;
    document.getElementById('rejectedCount').textContent = projects.filter(p => p.status === 'rejected').length;
}

function renderProjects(projects) {
    const tbody = document.getElementById('projectsTable');
    if (projects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📂</div><h3>No projects yet</h3><p>Submit your first project to get started!</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = projects.map(p => `
        <tr>
            <td><strong>${escHtml(p.title)}</strong></td>
            <td>${escHtml(p.technology || '—')}</td>
            <td>${p.faculty_name ? escHtml(p.faculty_name) : '<span style="color:var(--text-muted)">Not assigned</span>'}</td>
            <td><span class="badge badge-${p.status}">${p.status}</span></td>
            <td>${new Date(p.created_at).toLocaleDateString()}</td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-outline btn-sm" onclick="viewProject(${p.project_id})">View</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Modal helpers
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function openNewProjectModal() { openModal('newProjectModal'); }

// Submit new project
document.getElementById('newProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDesc').value.trim(),
        technology: document.getElementById('projectTech').value.trim()
    };
    try {
        const res = await fetch(`${API}/api/student/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Project submitted!', 'success');
            closeModal('newProjectModal');
            document.getElementById('newProjectForm').reset();
            loadProjects();
        } else {
            showToast(data.error || 'Failed to submit.', 'error');
        }
    } catch (e) {
        showToast('Network error.', 'error');
    }
});

// View project details
async function viewProject(projectId) {
    try {
        const res = await fetch(`${API}/api/student/projects`, { credentials: 'include' });
        const projects = await res.json();
        const project = projects.find(p => p.project_id === projectId);
        if (!project) { showToast('Project not found.', 'error'); return; }

        document.getElementById('detailTitle').textContent = project.title;
        document.getElementById('uploadProjectId').value = projectId;

        let html = `
            <div style="margin-bottom:16px">
                <p style="color:var(--text-secondary);font-size:14px;margin-bottom:12px">${escHtml(project.description || 'No description provided.')}</p>
                <div class="d-flex gap-2 flex-wrap">
                    <span class="badge badge-${project.status}">${project.status}</span>
                    ${project.technology ? `<span style="color:var(--text-muted);font-size:13px">🛠 ${escHtml(project.technology)}</span>` : ''}
                    ${project.faculty_name ? `<span style="color:var(--text-muted);font-size:13px">👨‍🏫 ${escHtml(project.faculty_name)}</span>` : ''}
                </div>
            </div>
        `;
        if (project.feedback) {
            html += `<div class="feedback-box"><div class="feedback-label">💬 Faculty Feedback</div><p>${escHtml(project.feedback)}</p></div>`;
        }
        document.getElementById('detailContent').innerHTML = html;

        // Load files
        loadFiles(projectId);

        openModal('projectDetailModal');
    } catch (e) {
        showToast('Failed to load project.', 'error');
    }
}

async function loadFiles(projectId) {
    try {
        const res = await fetch(`${API}/api/student/projects/${projectId}/files`, { credentials: 'include' });
        const files = await res.json();
        const container = document.getElementById('filesList');
        if (files.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No files uploaded yet.</p>';
            return;
        }
        container.innerHTML = files.map(f => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:var(--radius-sm);margin-bottom:8px">
                <div>
                    <span style="font-size:14px">📄 ${escHtml(f.file_name)}</span>
                    <span style="font-size:11px;color:var(--text-muted);margin-left:8px">${new Date(f.submission_date).toLocaleDateString()}</span>
                </div>
                <a href="/uploads/${f.file_path}" target="_blank" class="btn btn-outline btn-sm">Download</a>
            </div>
        `).join('');
    } catch (e) {
        document.getElementById('filesList').innerHTML = '<p style="color:var(--accent-red);font-size:13px">Failed to load files.</p>';
    }
}

// File upload
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const selectedFileName = document.getElementById('selectedFileName');

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        selectedFileName.textContent = fileInput.files[0].name;
        uploadBtn.disabled = false;
    } else {
        selectedFileName.textContent = '';
        uploadBtn.disabled = true;
    }
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectId = document.getElementById('uploadProjectId').value;
    if (!fileInput.files.length) { showToast('Please select a file.', 'error'); return; }

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch(`${API}/api/student/projects/${projectId}/upload`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            showToast('File uploaded!', 'success');
            fileInput.value = '';
            selectedFileName.textContent = '';
            loadFiles(projectId);
        } else {
            showToast(data.error || 'Upload failed.', 'error');
        }
    } catch (e) {
        showToast('Network error.', 'error');
    }
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Upload File';
});

// Close modal on clicking overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
});

init();
