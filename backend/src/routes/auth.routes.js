import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  getMe 
} from '../controllers/auth.controller.js';
import { 
  registerSchema, 
  loginSchema 
} from '../utils/validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;