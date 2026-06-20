import express from 'express';
import { markAttendance, getAllAttendanceRecords, getAttendanceByStudent, updateAttendance, deleteAttendance, getMyMetrics } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { attendanceValidator, checkMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

// Student-specific metrics dashboard route
router.get('/my-metrics', authorizeRoles('student'), getMyMetrics);

// Endpoint restriction rule: Only educators and administrators can write tracking metrics
router.post('/', authorizeRoles('admin', 'teacher'), attendanceValidator, markAttendance);

// General viewing authorization rule: Shared access across administrative roles and educators
router.get('/', authorizeRoles('admin', 'teacher'), getAllAttendanceRecords);

// Granular viewing context: Accessible by any validated profile layer (including the student tracking their own logs)
router.get('/student/:studentId', authorizeRoles('admin', 'teacher', 'student'), checkMongoId('studentId'), getAttendanceByStudent);

// Maintenance rules: Updates and deletions are protected access points limited to teachers and admins
router.put('/:id', [checkMongoId('id'), authorizeRoles('admin', 'teacher')], updateAttendance);
router.delete('/:id', [checkMongoId('id'), authorizeRoles('admin', 'teacher')], deleteAttendance);

export default router;
