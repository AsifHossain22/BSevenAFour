import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { adminController } from './admin.controller';

const router = Router();

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
