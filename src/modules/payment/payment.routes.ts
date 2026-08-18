import { Router } from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { auth } from '../../middlewares/auth';
import { paymentController } from './payment.controller';

const router = Router();

// CreatePaymentSession
router.post(
  '/create',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.createPaymentSession,
);

// PaymentHistory
router.get(
  '/',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.getUserPaymentHistory,
);

// PaymentDetails
router.get(
  '/:id',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.getPaymentDetails,
);

export const paymentRoutes = router;
