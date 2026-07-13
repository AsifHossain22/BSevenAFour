import { Router } from 'express';
import { serviceController } from './service.controller';
import { auth } from '../../middlewares/auth';

const router = Router();

// ServiceAPI
router.post('/services', auth('TECHNICIAN'), serviceController.createService);
router.get('/services', serviceController.getAllServices);

// TechnicianAPI
router.get('/technicians', serviceController.getAllTechnicians);
router.get('/technicians/:id', serviceController.getTechnicianById);

export const serviceRoutes = router;
