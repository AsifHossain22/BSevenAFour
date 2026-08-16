import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { technicianController } from './technician.controller';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

router.put(
  '/profile',
  auth(UserRole.TECHNICIAN),
  technicianController.updateProfile,
);

router.put(
  '/availability',
  auth(UserRole.TECHNICIAN),
  technicianController.updateAvailability,
);

router.get(
  '/bookings',
  auth(UserRole.TECHNICIAN),
  technicianController.getTechnicianBookings,
);

router.patch(
  '/bookings/:id',
  auth(UserRole.TECHNICIAN),
  technicianController.updateBookingStatus,
);

export const technicianRoutes = router;
