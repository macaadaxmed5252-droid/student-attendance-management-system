import express from 'express';
import { register, login } from '../controllers/authController.js';
import { authRegisterValidator, authLoginValidator } from '../middleware/validators.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/register', protect, authorizeRoles('admin'), authRegisterValidator, register);
router.post('/login', authLoginValidator, login);

export default router;
