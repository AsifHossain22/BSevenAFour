import { Router } from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { auth } from '../../middlewares/auth';
import { paymentController } from './payment.controller';

const router = Router();

// PaymentRoutes
router.post(
  '/create',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.createPaymentSession,
);

// PaymentHistoryRoutes
router.get(
  '/',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.getUserPaymentHistory,
);

// PaymentDetailsRoute
router.get(
  '/:id',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.getPaymentDetails,
);

// WebhookEndpointForStripe
router.post('/webhook', paymentController.handleStripeWebhook);

export const paymentRoutes = router;
