import express from 'express';
import { createTeacher, getAllTeachers, getTeacherById, updateTeacher, deleteTeacher } from '../controllers/teacherController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { teacherValidator, checkMongoId } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.post('/', teacherValidator, createTeacher);
router.get('/', getAllTeachers);
router.get('/:id', checkMongoId('id'), getTeacherById);
router.put('/:id', [checkMongoId('id'), teacherValidator], updateTeacher);
router.delete('/:id', checkMongoId('id'), deleteTeacher);

export default router;