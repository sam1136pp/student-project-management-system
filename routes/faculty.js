const express = require('express');
const db = require('../config/db');
const { isFaculty } = require('../middleware/auth');
const router = express.Router();

// GET /api/faculty/projects — get all projects assigned to this faculty
router.get('/projects', isFaculty, async (req, res) => {
    try {
        const [projects] = await db.query(
            `SELECT p.*, u.name AS student_name, u.email AS student_email, u.department AS student_department
             FROM projects p 
             JOIN users u ON p.student_id = u.user_id 
             WHERE p.faculty_id = ? 
             ORDER BY p.created_at DESC`,
            [req.session.user.user_id]
        );
        res.json(projects);
    } catch (err) {
        console.error('Get faculty projects error:', err);
        res.status(500).json({ error: 'Failed to fetch projects.' });
    }
});

// GET /api/faculty/projects/:id/files — get files for a project
router.get('/projects/:id/files', isFaculty, async (req, res) => {
    try {
        const projectId = req.params.id;

        // Verify this project is assigned to this faculty
        const [projects] = await db.query(
            'SELECT * FROM projects WHERE project_id = ? AND faculty_id = ?',
            [projectId, req.session.user.user_id]
        );
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found or not assigned to you.' });
        }

        const [files] = await db.query(
            'SELECT * FROM submissions WHERE project_id = ? ORDER BY submission_date DESC',
            [projectId]
        );
        res.json(files);
    } catch (err) {
        console.error('Get project files error:', err);
        res.status(500).json({ error: 'Failed to fetch files.' });
    }
});

// PUT /api/faculty/projects/:id/review — approve/reject with feedback
router.put('/projects/:id/review', isFaculty, async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const projectId = req.params.id;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "approved" or "rejected".' });
        }

        // Verify this project is assigned to this faculty
        const [projects] = await db.query(
            'SELECT * FROM projects WHERE project_id = ? AND faculty_id = ?',
            [projectId, req.session.user.user_id]
        );
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found or not assigned to you.' });
        }

        await db.query(
            'UPDATE projects SET status = ?, feedback = ? WHERE project_id = ?',
            [status, feedback || null, projectId]
        );

        res.json({ message: `Project ${status} successfully!` });
    } catch (err) {
        console.error('Review project error:', err);
        res.status(500).json({ error: 'Failed to review project.' });
    }
});

module.exports = router;
