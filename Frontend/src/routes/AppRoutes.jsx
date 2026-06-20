import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/Common/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Students from '../pages/Students/Students';
import AddStudent from '../pages/Students/AddStudent';
import EditStudent from '../pages/Students/EditStudent';
import Teachers from '../pages/Teachers/Teachers';
import AddTeacher from '../pages/Teachers/AddTeacher';
import EditTeacher from '../pages/Teachers/EditTeacher';
import Attendance from '../pages/Attendance/Attendance';
import Reports from '../pages/Reports/Reports';
import Classes from '../pages/Classes/Classes';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Student Administration Hierarchy */}
        <Route path="students" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><Students /></ProtectedRoute>} />
        <Route path="students/add" element={<ProtectedRoute allowedRoles={['admin']}><AddStudent /></ProtectedRoute>} />
        <Route path="students/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><EditStudent /></ProtectedRoute>} />

        {/* Class Management */}
        <Route path="classes" element={<ProtectedRoute allowedRoles={['admin']}><Classes /></ProtectedRoute>} />

        {/* Teacher Administration Hierarchy */}
        <Route path="teachers" element={<ProtectedRoute allowedRoles={['admin']}><Teachers /></ProtectedRoute>} />
        <Route path="teachers/add" element={<ProtectedRoute allowedRoles={['admin']}><AddTeacher /></ProtectedRoute>} />
        <Route path="teachers/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><EditTeacher /></ProtectedRoute>} />

        {/* Attendance Matrices */}
        <Route path="attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><Attendance /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><Reports /></ProtectedRoute>} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
