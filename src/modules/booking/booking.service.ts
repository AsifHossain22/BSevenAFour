/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookingStatus, UserRole } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import AppError from '../../utils/appError';
import httpStatus from 'http-status';

export interface CreateBookingPayload {
  serviceId: string;
  timeSlot: string | Date;
  notes?: string;
}

const createBookingInDB = async (
  payload: CreateBookingPayload,
  userId: string,
) => {
  const { serviceId, timeSlot } = payload;

  if (!serviceId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Service ID is required.');
  }

  if (!timeSlot) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Time slot date/time is required.',
    );
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, 'Target service not found.');
  }

  const newBooking = await prisma.booking.create({
    data: {
      customerId: userId,
      serviceId,
      timeSlot: new Date(timeSlot),
      status: BookingStatus.REQUESTED,
    },
    include: {
      service: {
        include: {
          category: true,
          technician: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return newBooking;
};

const getUserBookingsFromDB = async (
  userId: string,
  role: string,
  queryParams: Record<string, any> = {},
) => {
  const { serviceId, status } = queryParams;
  let whereCondition: any = {};

  if (serviceId) {
    whereCondition.serviceId = String(serviceId);
  }
  if (status) {
    whereCondition.status = status;
  }

  if (role === UserRole.CUSTOMER) {
    whereCondition.customerId = userId;
  } else if (role === UserRole.TECHNICIAN) {
    whereCondition.service = {
      ...whereCondition.service,
      technician: {
        userId: userId,
      },
    };
  }

  const bookings = await prisma.booking.findMany({
    where: whereCondition,
    include: {
      service: {
        include: {
          category: true,
          technician: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return bookings;
};

const getBookingByIdFromDB = async (
  bookingId: string,
  userId: string,
  role: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        include: {
          category: true,
          technician: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking record missing.');
  }

  if (role === UserRole.CUSTOMER && booking.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Unauthorized access to this booking.',
    );
  }

  return booking;
};

const cancelBookingInDB = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found.');
  }

  if (booking.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to cancel this booking.',
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.DECLINED,
    },
  });

  return updatedBooking;
};

export const bookingService = {
  createBookingInDB,
  getUserBookingsFromDB,
  getBookingByIdFromDB,
  cancelBookingInDB,
};
