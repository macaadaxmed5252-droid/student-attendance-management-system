import express from 'express';
import { markAttendance, getAllAttendanceRecords, getAttendanceByStudent, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { attendanceValidator, checkMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

// Endpoint restriction rule: Only teachers are authorized to write or append tracking metrics
router.post('/', authorizeRoles('teacher'), attendanceValidator, markAttendance);

// General viewing authorization rule: Shared access across administrative roles and educators
router.get('/', authorizeRoles('admin', 'teacher'), getAllAttendanceRecords);

// Granular viewing context: Accessible by any validated profile layer (including the student tracking their own logs)
router.get('/student/:studentId', checkMongoId('studentId'), getAttendanceByStudent);

// Maintenance rules: Updates and deletions are protected access points limited to teachers and admins
router.put('/:id', [checkMongoId('id'), authorizeRoles('admin', 'teacher')], updateAttendance);
router.delete('/:id', [checkMongoId('id'), authorizeRoles('admin', 'teacher')], deleteAttendance);

export default router;