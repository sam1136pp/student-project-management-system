const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/stats — dashboard statistics
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const [students] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student'");
        const [faculty] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'faculty'");
        const [projects] = await db.query("SELECT COUNT(*) AS count FROM projects");
        const [pending] = await db.query("SELECT COUNT(*) AS count FROM projects WHERE status = 'pending'");
        const [approved] = await db.query("SELECT COUNT(*) AS count FROM projects WHERE status = 'approved'");
        const [rejected] = await db.query("SELECT COUNT(*) AS count FROM projects WHERE status = 'rejected'");

        res.json({
            totalStudents: students[0].count,
            totalFaculty: faculty[0].count,
            totalProjects: projects[0].count,
            pendingProjects: pending[0].count,
            approvedProjects: approved[0].count,
            rejectedProjects: rejected[0].count
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch statistics.' });
    }
});

// GET /api/admin/users — list all users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, username, role, name, email, department, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (err) {
        console.error('List users error:', err);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// POST /api/admin/users — create a new user
router.post('/users', isAdmin, async (req, res) => {
    try {
        const { username, password, name, email, department, role } = req.body;

        if (!username || !password || !name || !email || !role) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (username, password, role, name, email, department) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, role, name, email, department || null]
        );

        res.status(201).json({ message: 'User created successfully!', userId: result.insertId });
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Failed to create user.' });
    }
});

// DELETE /api/admin/users/:id — remove a user
router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent deleting yourself
        if (parseInt(userId) === req.session.user.user_id) {
            return res.status(400).json({ error: 'Cannot delete your own account.' });
        }

        const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'User deleted successfully!' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});

// GET /api/admin/projects — list all projects
router.get('/projects', isAdmin, async (req, res) => {
    try {
        const [projects] = await db.query(
            `SELECT p.*, 
                    s.name AS student_name, s.department AS student_department,
                    f.name AS faculty_name
             FROM projects p 
             JOIN users s ON p.student_id = s.user_id 
             LEFT JOIN users f ON p.faculty_id = f.user_id 
             ORDER BY p.created_at DESC`
        );
        res.json(projects);
    } catch (err) {
        console.error('List projects error:', err);
        res.status(500).json({ error: 'Failed to fetch projects.' });
    }
});

// PUT /api/admin/projects/:id/assign — assign a mentor to a project
router.put('/projects/:id/assign', isAdmin, async (req, res) => {
    try {
        const { faculty_id } = req.body;
        const projectId = req.params.id;

        if (!faculty_id) {
            return res.status(400).json({ error: 'Faculty ID is required.' });
        }

        // Verify faculty exists
        const [faculty] = await db.query(
            "SELECT user_id FROM users WHERE user_id = ? AND role = 'faculty'",
            [faculty_id]
        );
        if (faculty.length === 0) {
            return res.status(404).json({ error: 'Faculty not found.' });
        }

        await db.query(
            'UPDATE projects SET faculty_id = ? WHERE project_id = ?',
            [faculty_id, projectId]
        );

        res.json({ message: 'Mentor assigned successfully!' });
    } catch (err) {
        console.error('Assign mentor error:', err);
        res.status(500).json({ error: 'Failed to assign mentor.' });
    }
});

// GET /api/admin/faculty — list all faculty (for dropdown)
router.get('/faculty', isAdmin, async (req, res) => {
    try {
        const [faculty] = await db.query(
            "SELECT user_id, name, department FROM users WHERE role = 'faculty' ORDER BY name"
        );
        res.json(faculty);
    } catch (err) {
        console.error('List faculty error:', err);
        res.status(500).json({ error: 'Failed to fetch faculty list.' });
    }
});

module.exports = router;
