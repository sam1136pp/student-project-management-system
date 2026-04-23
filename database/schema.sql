-- =============================================
-- Student Project Management System (SPMS)
-- Database Schema
-- =============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS spms_db;
USE spms_db;

-- =============================================
-- TABLE: users
-- Unified table for all user types
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'admin') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: projects
-- Stores all project submissions
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    faculty_id INT DEFAULT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    technology VARCHAR(200),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    feedback TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- =============================================
-- TABLE: submissions
-- Stores uploaded files for each project
-- =============================================
CREATE TABLE IF NOT EXISTS submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- =============================================
-- SAMPLE DATA
-- Passwords are bcrypt hashes of the shown values
-- =============================================

-- Admin: admin / admin123
INSERT INTO users (username, password, role, name, email, department) VALUES
('admin', '$2b$10$I.yWtzoiaKHvkiig5k7XA.Cdudg/XBQgauEvA6XVKikdHSyBaHMXa', 'admin', 'System Administrator', 'admin@spms.edu', 'Administration');

-- Faculty: faculty1 / faculty123, faculty2 / faculty123
INSERT INTO users (username, password, role, name, email, department) VALUES
('faculty1', '$2b$10$Oj.9w24caxc4CvVAahW7DeEkqMMY6u/u2fEKxOzdZ58jwgbKelzYO', 'faculty', 'Dr. Rajesh Kumar', 'rajesh@spms.edu', 'Computer Science'),
('faculty2', '$2b$10$Oj.9w24caxc4CvVAahW7DeEkqMMY6u/u2fEKxOzdZ58jwgbKelzYO', 'faculty', 'Dr. Priya Sharma', 'priya@spms.edu', 'Information Technology');

-- Students: student1 / student123, student2 / student123, student3 / student123
INSERT INTO users (username, password, role, name, email, department) VALUES
('student1', '$2b$10$gar5obRteZOZCgoAQcjomu.Uy.cKKc2gxue.35lNAhLt/d9Rjx3sK', 'student', 'Swaroop Bangre', 'swaroop@spms.edu', 'Computer Science'),
('student2', '$2b$10$gar5obRteZOZCgoAQcjomu.Uy.cKKc2gxue.35lNAhLt/d9Rjx3sK', 'student', 'Sneha Reddy', 'sneha@spms.edu', 'Computer Science'),
('student3', '$2b$10$gar5obRteZOZCgoAQcjomu.Uy.cKKc2gxue.35lNAhLt/d9Rjx3sK', 'student', 'Vikram Singh', 'vikram@spms.edu', 'Information Technology');

-- Sample Projects
INSERT INTO projects (student_id, faculty_id, title, description, technology, status, feedback) VALUES
(4, 2, 'Online Library Management System', 'A web application to manage library books, issue/return, and member records.', 'Node.js, MySQL, HTML/CSS', 'approved', 'Excellent work! Well-structured database design.'),
(5, 3, 'E-Commerce Platform', 'A basic e-commerce website with product listing, cart, and checkout.', 'React, Express, MongoDB', 'pending', NULL),
(6, NULL, 'Weather Forecast App', 'A weather app using external APIs to show real-time data.', 'Python, Flask, OpenWeatherAPI', 'pending', NULL);
