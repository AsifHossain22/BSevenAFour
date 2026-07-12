import { prisma } from '../../lib/prisma';
import { UserRole } from '../../../generated/prisma/enums';

import httpStatus from 'http-status';
import AppError from '../../utils/AppError';

const createBooking = async (payload: any, customerId: string) => {
  const { serviceId, timeSlot } = payload;

  const targetService = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!targetService) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The requested service could not be found.',
    );
  }

  return await prisma.booking.create({
    data: {
      customerId,
      serviceId,
      timeSlot: new Date(timeSlot),
    },
    include: {
      service: {
        include: {
          technician: {
            include: {
              user: {
                select: {
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
};

const getUserBookings = async (userId: string, role: string) => {
  if (role === UserRole.TECHNICIAN) {
    return await prisma.booking.findMany({
      where: {
        service: {
          technician: {
            userId,
          },
        },
      },
      include: {
        service: true,
        customer: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    });
  }

  // CustomerQuery
  return await prisma.booking.findMany({
    where: {
      customerId: userId,
    },
    include: {
      service: {
        include: {
          technician: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const getBookingById = async (
  bookingId: string,
  userId: string,
  role: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payments: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
        },
      },
      service: {
        include: {
          technician: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking record not found.');
  }

  const isOwnerOfBooking =
    booking.customerId === userId ||
    booking.service.technician.user.id === userId ||
    role === UserRole.ADMIN;

  if (!isOwnerOfBooking) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to view this booking record.',
    );
  }

  return booking;
};

export const bookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
};
