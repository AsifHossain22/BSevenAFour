import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { bookingController } from './booking.controller';
import { UserRole } from '../../../generated/prisma/enums';

const router = Router();

router.post('/', auth(UserRole.CUSTOMER), bookingController.createBooking);

router.get(
  '/',
  auth(UserRole.CUSTOMER, UserRole.TECHNICIAN, UserRole.ADMIN),
  bookingController.getUserBookings,
);

router.get(
  '/:id',
  auth(UserRole.CUSTOMER, UserRole.TECHNICIAN, UserRole.ADMIN),
  bookingController.getBookingById,
);

router.patch(
  '/:id/cancel',
  auth(UserRole.CUSTOMER),
  bookingController.cancelBooking,
);

export const bookingRoutes = router;
