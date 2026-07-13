import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { bookingService } from './booking.service';
import AppError from '../../utils/appError';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  if (!customerId)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required.');

  const result = await bookingService.createBookingInDB(req.body, customerId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Booking successfully scheduled!',
    data: result,
  });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;
  const result = await bookingService.getUserBookingsFromDB(userId, role);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User bookings retrieved successfully.',
    data: result,
  });
});

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

export const bookingController = {
  createBooking,
  getUserBookings,
  getBookingById,
};
