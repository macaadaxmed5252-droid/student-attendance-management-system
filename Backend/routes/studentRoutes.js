import express from 'express';
import { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { studentValidator, checkMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('admin', 'teacher'), getAllStudents);
router.get('/:id', authorizeRoles('admin', 'teacher'), checkMongoId('id'), getStudentById);
router.post('/', authorizeRoles('admin'), studentValidator, createStudent);
router.put('/:id', authorizeRoles('admin'), [checkMongoId('id'), studentValidator], updateStudent);
router.delete('/:id', authorizeRoles('admin'), checkMongoId('id'), deleteStudent);

export default router;
