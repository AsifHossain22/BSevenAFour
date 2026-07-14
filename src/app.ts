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
import { notFound } from './middlewares/notFound';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

const app: Application = express();

// CORS
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(
  express.json({
    verify: (req: any, res, buf) => {
      if (req.originalUrl.includes('/api/payments/webhook')) {
        req.rawBody = buf;
      }
    },
  }),
);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// RootAPI
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to FixItNow Server!');
});

// AuthAPI
app.use('/api/auth', authRoutes);

// ServiceAndTechnicianAPI
app.use('/api', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/technician', technicianRoutes);

// BookingAPI
app.use('/api/bookings', bookingRoutes);

// PaymentAPI
app.use('/api/payments', paymentRoutes);

// ReviewsAPI
app.use('/api/reviews', reviewRoutes);

// AdminAPI
app.use('/api/admin', adminRoutes);

// ErrorHandlers
app.use(notFound);
app.use(globalErrorHandler);

export default app;
