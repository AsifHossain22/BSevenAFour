import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { technicianController } from './technician.controller';

const router = Router();

router.put('/profile', auth('TECHNICIAN'), technicianController.updateProfile);

router.put(
  '/availability',
  auth('TECHNICIAN'),
  technicianController.updateAvailability,
);

router.get(
  '/bookings',
  auth('TECHNICIAN'),
  technicianController.getTechnicianBookings,
);

router.patch(
  '/bookings/:id',
  auth('TECHNICIAN'),
  technicianController.updateBookingStatus,
);

export const technicianRoutes = router;
