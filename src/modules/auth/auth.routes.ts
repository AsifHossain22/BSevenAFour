import { Router } from 'express';
import { authController } from './auth.controller';
import { auth } from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

// RegisterAPI
router.post('/register', authController.registerUser);

// LogInAPI
router.post('/login', authController.loginUser);

// CurrentProfileAPI
router.get(
  '/me',
  auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  authController.getMe,
);

export const authRoutes = router;
