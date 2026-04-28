const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email, department, role } = req.body;

        if (!username || !password || !name || !email || !role) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Only allow student and faculty self-registration
        const allowedRoles = ['student', 'faculty'];
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ error: 'Invalid role. Only students and faculty can self-register.' });
        }

        // Enforce minimum password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Check if username or email already exists
        const [existing] = await db.query(
            'SELECT user_id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (username, password, role, name, email, department) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, role, name, email, department || null]
        );

        res.status(201).json({ message: 'Registration successful!', userId: result.insertId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Find user
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Store user in session (excluding password)
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email,
            department: user.department
        };

        res.json({
            message: 'Login successful!',
            user: req.session.user
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// GET /api/auth/logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed.' });
        }
        res.json({ message: 'Logged out successfully.' });
    });
});

// GET /api/auth/me — get current logged-in user
router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ user: req.session.user });
    }
    return res.status(401).json({ error: 'Not logged in.' });
});

module.exports = router;
