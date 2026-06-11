import express from 'express';
import { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { studentValidator, checkMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'teacher'));

router.post('/', studentValidator, createStudent);
router.get('/', getAllStudents);
router.get('/:id', checkMongoId('id'), getStudentById);
router.put('/:id', [checkMongoId('id'), studentValidator], updateStudent);
router.delete('/:id', checkMongoId('id'), deleteStudent);

export default router;