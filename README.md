# Student Attendance Management System

An enterprise-grade, full-stack Academic Attendance Tracker designed to digitize, streamline, and secure daily classroom attendance lifecycles. Built with a highly responsive React frontend and a secure Node.js/Express backend environment.

## 🚀 Architectural Concept & User Hierarchy

The ecosystem operates under a strict role-based access control (RBAC) matrix divided into three transactional layers:

* **System Administrators (Admin):** Hold full-scale data operational capacities. Admins handle the secure onboarding, profile mutations, and decommissioning of Faculty Staff (Teachers) and Institutional Cohorts (Students).
* **Faculty Educators (Teachers):** Retain execution parameters to initiate, update, and manage daily attendance matrices (`Present`, `Absent`, `Late`) mapped against unique calendar timestamps.
* **Institutional Cohorts (Students):** Maintain read-only entry profiles to track their individual chronological attendance progress, minimizing manual administrative reporting overhead.

---

## 🛠️ Technical Stack & Dependencies

### Frontend Architecture
* **Core:** React.js (Vite Bundle Wrapper)
* **Routing Matrix:** `react-router-dom` (Declarative Protected Route Architecture)
* **Styles Engine:** Tailwind CSS & PostCSS
* **API Client:** Axios (Asynchronous Request Context)
* **UI Components:** `react-icons`

### Backend Architecture
* **Runtime:** Node.js
* **Framework Layer:** Express.js
* **Database Schema Object:** MongoDB Atlas via Mongoose ODM
* **Security Architecture:** JSON Web Tokens (JWT) & bcrypt.js password hashing
* **Development Watcher:** Nodemon

---

## 📦 System Structural Layout

```text
Student Attendance Management System/
├── Backend/
│   ├── config/          # Database connection configurations
│   ├── controllers/     # Route handler logic layers
│   ├── middleware/      # JWT Protection & RBAC matrices
│   ├── models/          # MongoDB structural schemas (User, Attendance)
│   ├── routes/          # Express end-point matrices
│   └── server.js        # Application root entry point
└── Frontend/
    └── src/
        ├── components/  # Reusable UI Atoms (StatCard, ProtectedRoute)
        ├── context/     # Global Auth state synchronization
        ├── layouts/     # Dashboard container wrappers
        ├── pages/       # System views (Dashboard, Attendance, Reports)
        └── routes/      # Frontend declarative router configuration
