import { Router } from 'express';
import { serviceController } from './service.controller';

const router = Router();

// ServiceAPI
router.get('/services', serviceController.getAllServices);

// TechnicianAPI
router.get('/technicians', serviceController.getAllTechnicians);
router.get('/technicians/:id', serviceController.getTechnicianById);

export const serviceRoutes = router;
