import express from 'express';
import { register, login } from '../controllers/authController.js';
import { authRegisterValidator, authLoginValidator } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', authRegisterValidator, register);
router.post('/login', authLoginValidator, login);

export default router;