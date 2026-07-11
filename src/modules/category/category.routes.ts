import { Router } from 'express';
import { categoryController } from './category.controller';
import { auth } from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

// CreateCategory
router.post(
  '/',
  auth(UserRole.ADMIN || UserRole.TECHNICIAN),
  categoryController.createCategory,
);

// GetAllCategories
router.get('/', categoryController.getAllCategories);

export const categoryRoutes = router;
