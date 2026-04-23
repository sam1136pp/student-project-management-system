// Authentication middleware
// Checks if user is logged in and has the required role

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
}

function isStudent(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'student') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Students only.' });
}

function isFaculty(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'faculty') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Faculty only.' });
}

function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Admin only.' });
}

module.exports = { isAuthenticated, isStudent, isFaculty, isAdmin };
