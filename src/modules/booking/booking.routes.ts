import { Router } from 'express';
import { auth } from '../../middlewares/auth';
import { bookingController } from './booking.controller';

const router = Router();

router.post('/', auth('CUSTOMER'), bookingController.createBooking);

router.get(
  '/',
  auth('CUSTOMER', 'TECHNICIAN'),
  bookingController.getUserBookings,
);

router.get(
  '/:id',
  auth('CUSTOMER', 'TECHNICIAN'),
  bookingController.getBookingById,
);

export const bookingRoutes = router;
