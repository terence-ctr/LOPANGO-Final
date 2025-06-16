import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('phone').isMobilePhone('any'),
  body('userType').isIn(['tenant', 'landlord', 'agent', 'admin'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('userType').isIn(['tenant', 'landlord', 'agent', 'admin'])
];

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

// Protected routes (require authentication)
router.get('/me', authenticate, AuthController.getCurrentUser);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/change-password', authenticate, AuthController.changePassword);

export default router;
