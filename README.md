# 📚 Student Project Management System (SPMS)

A full-stack web application built using **DBMS concepts** to manage student academic projects in colleges. The system supports three user roles: **Students**, **Faculty/Mentors**, and **Administrators**.

> Built as a DBMS project demonstrating **ER modeling, normalization, relational schema design, CRUD operations, and referential integrity**.

---

## 🚀 Features

### 🎓 Student
- Submit project details (title, description, technology)
- Upload project files (PDF, DOCX, ZIP, etc.)
- Track project status (Pending / Approved / Rejected)
- View faculty feedback

### 👨‍🏫 Faculty / Mentor
- View all assigned student projects
- Download submitted files
- Approve or reject projects with feedback

### 🔐 Admin
- Dashboard with system-wide statistics
- Add and remove users (students, faculty, admins)
- View all projects across the system
- Assign mentors to student projects

---

## 🛠 Technology Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | HTML5, CSS3, JavaScript (Vanilla)   |
| Backend   | Node.js, Express.js                 |
| Database  | MySQL                               |
| Auth      | express-session, bcryptjs           |
| Uploads   | multer                              |

---

## 📁 Project Structure

```
├── server.js              # Express entry point
├── package.json
├── .env                   # Database credentials
├── database/
│   └── schema.sql         # Full MySQL schema + sample data
├── config/
│   └── db.js              # MySQL connection pool
├── middleware/
│   └── auth.js            # Role-based auth middleware
├── routes/
│   ├── auth.js            # Login / Register / Logout
│   ├── student.js         # Student CRUD + file upload
│   ├── faculty.js         # Faculty review routes
│   └── admin.js           # Admin management routes
├── uploads/               # Uploaded project files
└── public/                # Static frontend files
    ├── index.html         # Login page
    ├── register.html      # Registration page
    ├── css/style.css      # Global stylesheet
    ├── js/                # Frontend JavaScript
    ├── student/           # Student dashboard
    ├── faculty/           # Faculty dashboard
    └── admin/             # Admin dashboard
```

---

## ⚡ Setup Instructions

### Prerequisites
- **Node.js** (v16+)
- **MySQL** (v8+) with MySQL Workbench

### 1. Clone the repository
```bash
git clone https://github.com/sam1136pp/student-project-management-system.git
cd student-project-management-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
- Open **MySQL Workbench**
- Run the SQL script in `database/schema.sql` to create the database, tables, and sample data

### 4. Configure environment variables
Edit the `.env` file and set your MySQL password:
```
DB_PASSWORD=your_mysql_root_password
```

### 5. Start the server
```bash
npm start
```

### 6. Open in browser
Navigate to `http://localhost:3000`

---

## 🔑 Demo Accounts

| Role     | Username   | Password     |
|----------|------------|--------------|
| Admin    | admin      | admin123     |
| Faculty  | faculty1   | faculty123   |
| Faculty  | faculty2   | faculty123   |
| Student  | student1   | student123   |
| Student  | student2   | student123   |
| Student  | student3   | student123   |

---

## 📐 Database Design

### ER Diagram Entities
- **Users** (student / faculty / admin)
- **Projects** (submitted by students, supervised by faculty)
- **Submissions** (files uploaded per project)

### Key Relationships
- A student submits multiple projects (1:N)
- A faculty supervises multiple projects (1:N)
- A project has multiple file submissions (1:N)

### Normalization
- All tables are in **3NF (Third Normal Form)**
- Foreign key constraints ensure **referential integrity**

---

## 📄 License

This project is developed for academic purposes.

---

## 👨‍💻 Author

**sam1136pp** — [GitHub Profile](https://github.com/sam1136pp)
