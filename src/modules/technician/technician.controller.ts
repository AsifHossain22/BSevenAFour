import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { BookingStatus } from '../../../generated/prisma/enums';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { technicianService } from './technician.service';
import AppError from '../../utils/appError';

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You must be logged in to modify your profile.',
    );
  }

  const result = await technicianService.updateProfileInDB(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Technician profile updated successfully!',
    data: result,
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Authentication context missing.',
    );
  }

  const { slots } = req.body;
  if (!Array.isArray(slots)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Availability slots must be passed inside an array.',
    );
  }

  const result = await technicianService.updateAvailabilityInDB(userId, slots);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Availability schedule synced successfully!',
    data: result,
  });
});

const getTechnicianBookings = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Authentication token required.',
      );
    }

    const result = await technicianService.getTechnicianBookingsFromDB(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Assigned incoming bookings fetched successfully!',
      data: result,
    });
  },
);

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id: bookingId } = req.params;
  const { status } = req.body;

  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Authentication token missing.',
    );
  }
  if (!bookingId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A target booking ID param is required.',
    );
  }
  if (!status) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please provide the new tracking status payload.',
    );
  }

  const result = await technicianService.updateBookingStatusInDB(
    bookingId as string,
    userId,
    status as BookingStatus,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Booking tracking status shifted to ${status} successfully!`,
    data: result,
  });
});

export const technicianController = {
  updateProfile,
  updateAvailability,
  getTechnicianBookings,
  updateBookingStatus,
};
