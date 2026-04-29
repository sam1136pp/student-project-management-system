const mysql = require('mysql2/promise');
require('dotenv').config();

// Support Railway's MYSQL_URL (full connection string) or individual vars
// Railway exposes: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQL_URL
// Local dev uses: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

const dbConfig = process.env.MYSQL_URL
    ? {
        uri: process.env.MYSQL_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
    : {
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'spms_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

const pool = mysql.createPool(dbConfig);

// Test connection on startup
pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL connection failed:', err.message);
    });

module.exports = pool;
