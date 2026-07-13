import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { adminController } from './admin.controller';

const router = Router();

router.get('/users', auth('ADMIN'), adminController.getAllUsers);

router.patch('/users/:id', auth('ADMIN'), adminController.updateUserStatus);

router.get('/bookings', auth('ADMIN'), adminController.getAllBookings);

router.post(
  '/categories',
  auth('ADMIN'),
  adminController.createServiceCategory,
);

router.get(
  '/categories',
  auth('ADMIN'),
  adminController.getAllServiceCategories,
);

export const adminRoutes = router;
