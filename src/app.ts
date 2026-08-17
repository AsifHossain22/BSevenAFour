import cookieParser from 'cookie-parser';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import { authRoutes } from './modules/auth/auth.routes';
import { categoryRoutes } from './modules/category/category.routes';
import { serviceRoutes } from './modules/service/service.routes';
import { technicianRoutes } from './modules/technician/technician.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { bookingRoutes } from './modules/booking/booking.routes';
import { reviewRoutes } from './modules/review/review.routes';
import { paymentRoutes } from './modules/payment/payment.routes';
import { paymentController } from './modules/payment/payment.controller';
import { notFound } from './middlewares/notFound';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

const app: Application = express();

// CORS
app.use(
  cors({
    origin: config.app_url ? [config.app_url] : true,
    credentials: true,
  }),
);

// StripeWebhookHandler (BEFORE express.json)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook,
);

// GlobalBodyParsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// RootAPI
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to FixItNow Server!');
});

// APIRoutes
app.use('/api/auth', authRoutes);
app.use('/api', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/technician', technicianRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// ErrorHandlers
app.use(notFound);
app.use(globalErrorHandler);

export default app;
