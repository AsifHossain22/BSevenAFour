import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { bookingController } from './booking.controller';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

// CreateBooking
router.post('/', auth(UserRole.CUSTOMER), bookingController.createBooking);

// GetAllUserBookings
router.get(
  '/',
  auth(UserRole.CUSTOMER, UserRole.TECHNICIAN, UserRole.ADMIN),
  bookingController.getUserBookings,
);

// GetSingleBookingById
router.get(
  '/:id',
  auth(UserRole.CUSTOMER, UserRole.TECHNICIAN, UserRole.ADMIN),
  bookingController.getBookingById,
);

// CancelBooking
router.patch(
  '/:id/cancel',
  auth(UserRole.CUSTOMER),
  bookingController.cancelBooking,
);

export const bookingRoutes = router;
