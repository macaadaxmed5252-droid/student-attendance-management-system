import express from 'express';
import { getAllClasses, createClass, updateClass, deleteClass } from '../controllers/classController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllClasses)
  .post(protect, authorizeRoles('admin'), createClass);

router.route('/:id')
  .put(protect, authorizeRoles('admin'), updateClass)
  .delete(protect, authorizeRoles('admin'), deleteClass);

export default router;
