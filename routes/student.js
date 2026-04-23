const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const { isStudent } = require('../middleware/auth');
const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx', '.zip', '.rar', '.ppt', '.pptx', '.txt', '.jpg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed. Allowed: pdf, doc, docx, zip, rar, ppt, pptx, txt, jpg, png'));
        }
    }
});

// GET /api/student/projects — get all projects by this student
router.get('/projects', isStudent, async (req, res) => {
    try {
        const [projects] = await db.query(
            `SELECT p.*, u.name AS faculty_name 
             FROM projects p 
             LEFT JOIN users u ON p.faculty_id = u.user_id 
             WHERE p.student_id = ? 
             ORDER BY p.created_at DESC`,
            [req.session.user.user_id]
        );
        res.json(projects);
    } catch (err) {
        console.error('Get student projects error:', err);
        res.status(500).json({ error: 'Failed to fetch projects.' });
    }
});

// POST /api/student/projects — submit a new project
router.post('/projects', isStudent, async (req, res) => {
    try {
        const { title, description, technology } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Project title is required.' });
        }

        const [result] = await db.query(
            'INSERT INTO projects (student_id, title, description, technology) VALUES (?, ?, ?, ?)',
            [req.session.user.user_id, title, description || null, technology || null]
        );

        res.status(201).json({ message: 'Project submitted successfully!', projectId: result.insertId });
    } catch (err) {
        console.error('Submit project error:', err);
        res.status(500).json({ error: 'Failed to submit project.' });
    }
});

// PUT /api/student/projects/:id — update project details
router.put('/projects/:id', isStudent, async (req, res) => {
    try {
        const { title, description, technology } = req.body;
        const projectId = req.params.id;

        // Verify ownership
        const [projects] = await db.query(
            'SELECT * FROM projects WHERE project_id = ? AND student_id = ?',
            [projectId, req.session.user.user_id]
        );
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        await db.query(
            'UPDATE projects SET title = ?, description = ?, technology = ? WHERE project_id = ?',
            [title || projects[0].title, description || projects[0].description, technology || projects[0].technology, projectId]
        );

        res.json({ message: 'Project updated successfully!' });
    } catch (err) {
        console.error('Update project error:', err);
        res.status(500).json({ error: 'Failed to update project.' });
    }
});

// POST /api/student/projects/:id/upload — upload file to a project
router.post('/projects/:id/upload', isStudent, upload.single('file'), async (req, res) => {
    try {
        const projectId = req.params.id;

        // Verify ownership
        const [projects] = await db.query(
            'SELECT * FROM projects WHERE project_id = ? AND student_id = ?',
            [projectId, req.session.user.user_id]
        );
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        await db.query(
            'INSERT INTO submissions (project_id, file_name, file_path) VALUES (?, ?, ?)',
            [projectId, req.file.originalname, req.file.filename]
        );

        res.status(201).json({ message: 'File uploaded successfully!', fileName: req.file.originalname });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Failed to upload file.' });
    }
});

// GET /api/student/projects/:id/files — get all files for a project
router.get('/projects/:id/files', isStudent, async (req, res) => {
    try {
        const projectId = req.params.id;

        // Verify ownership
        const [projects] = await db.query(
            'SELECT * FROM projects WHERE project_id = ? AND student_id = ?',
            [projectId, req.session.user.user_id]
        );
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const [files] = await db.query(
            'SELECT * FROM submissions WHERE project_id = ? ORDER BY submission_date DESC',
            [projectId]
        );
        res.json(files);
    } catch (err) {
        console.error('Get files error:', err);
        res.status(500).json({ error: 'Failed to fetch files.' });
    }
});

module.exports = router;
