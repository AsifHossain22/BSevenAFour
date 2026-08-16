import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { bookingService } from './booking.service';
import AppError from '../../utils/appError';

// CreateBooking
const createBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  if (!customerId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required.');
  }

  const result = await bookingService.createBookingInDB(req.body, customerId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Booking successfully scheduled!',
    data: result,
  });
});

// GetAllUserBookings
const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;

  console.log(`[GET BOOKINGS] User ID: ${userId} | Role: ${role}`);

  const result = await bookingService.getUserBookingsFromDB(
    userId,
    role,
    req.query,
  );

  console.log(`[GET BOOKINGS] Retrieved ${result.length} record(s)`);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User bookings retrieved successfully.',
    data: result,
  });
});

// GetSingleBookingById
const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id: bookingId } = req.params;
  const { id: userId, role } = req.user!;

  const result = await bookingService.getBookingByIdFromDB(
    bookingId as string,
    userId,
    role,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Booking details fetched successfully.',
    data: result,
  });
});

// CancelBooking
const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { id: bookingId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required.');
  }

  const result = await bookingService.cancelBookingInDB(
    bookingId as string,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Booking cancelled successfully.',
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
};
