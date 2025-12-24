import { Router } from 'express';
import { register, login, logout, getProfile } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.post('/register', authenticate, authorize('admin'), register);
router.get('/profile', authenticate, getProfile);

export default router;
