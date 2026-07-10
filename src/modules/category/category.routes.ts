import { Router } from 'express';
import { categoryController } from './category.controller';

const router = Router();

// GetAllCategories
router.get('/', categoryController.getAllCategories);

export const categoryRoutes = router;
