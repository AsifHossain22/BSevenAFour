import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { bookingService } from './booking.service';
import AppError from '../../utils/AppError';

const createBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You must be logged in.');
    }

    const customerId = req.user.id;
    const result = await bookingService.createBooking(req.body, customerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Booking requested successfully!',
      data: result,
    });
  },
);

const getUserBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You must be logged in.');
    }

    const { id: userId, role } = req.user;
    const result = await bookingService.getUserBookings(userId, role);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Bookings retrieved successfully!',
      data: result,
    });
  },
);

const getBookingById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You must be logged in.');
    }

    const { id: bookingId } = req.params;

    if (!bookingId || typeof bookingId !== 'string') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'A valid booking ID parameter must be provided.',
      );
    }

    const { id: userId, role } = req.user;
    const result = await bookingService.getBookingById(bookingId, userId, role);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Booking details fetched successfully!',
      data: result,
    });
  },
);

export const bookingController = {
  createBooking,
  getUserBookings,
  getBookingById,
};
