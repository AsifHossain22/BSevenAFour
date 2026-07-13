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

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);
app.use(express.json());
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

// AdminAPI
app.use('/api/admin', adminRoutes);

export default app;
