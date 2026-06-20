import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import { ensureAttendanceIndexes } from './models/Attendance.js';

// Load route controllers
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import classRoutes from './routes/classRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Configuration definitions initialization
dotenv.config();
const app = express();

// Global Network Resource Protocol & Header protection assembly initializations
app.use(helmet());
app.use(cors({
  origin: [
    process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());

// Application API routes mapping definitions
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/upload', uploadRoutes);

// Fallback Route intercept point addressing unmapped request endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: `Resource context route targeting path not identified: ${req.originalUrl}` });
});

// Centralized System Error Handling Framework
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Establish state connectivity configurations to database engine target endpoint structures
  await connectDB();
  await ensureAttendanceIndexes();

app.get('/', (req, res) => {
  res.status(200).json({ message: "Welcome to the Student Attendance Management System API!" });
});

  app.listen(PORT, () => {
    console.log(`Server executing securely in context layer [${process.env.NODE_ENV}] listening across port channel: ${PORT}`);
  });
};

startServer();
