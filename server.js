const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// MIDDLEWARE
// ========================
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'spms_fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: false // set to true in production with HTTPS
    }
}));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================
// API ROUTES
// ========================
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const facultyRoutes = require('./routes/faculty');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);

// ========================
// CATCH-ALL: Serve index.html for non-API routes
// ========================
app.get('/{*path}', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// ========================
// GLOBAL ERROR HANDLER
// ========================
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);

    // Handle multer file size / type errors
    if (err.message && err.message.includes('File type not allowed')) {
        return res.status(400).json({ error: err.message });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }

    res.status(500).json({ error: 'Internal server error.' });
});

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
    console.log(`\n🚀 SPMS Server running at http://localhost:${PORT}`);
    console.log(`📂 Static files served from /public`);
    console.log(`📁 Uploads stored in /uploads\n`);
});

