import express, { Router } from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { auth } from '../../middlewares/auth';
import { paymentController } from './payment.controller';

const router = Router();

router.post(
  '/create',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.createPaymentSession,
);

router.get(
  '/',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.getUserPaymentHistory,
);

router.get(
  '/:id',
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  paymentController.getPaymentDetails,
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook,
);

export const paymentRoutes = router;
