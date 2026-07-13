import { BookingStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import AppError from '../../utils/appError';
import httpStatus from 'http-status';

const createBookingInDB = async (payload: any, customerId: string) => {
  const { serviceId, timeSlot } = payload;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service)
    throw new AppError(httpStatus.NOT_FOUND, 'Target service not found.');

  return await prisma.booking.create({
    data: {
      customerId,
      serviceId,
      techProfileId: service.techProfileId,
      timeSlot: new Date(timeSlot),
      status: BookingStatus.REQUESTED,
    },
  });
};

const getUserBookingsFromDB = async (userId: string, role: string) => {
  const filter =
    role === 'CUSTOMER'
      ? {
          customerId: userId,
        }
      : {
          techProfile: {
            userId,
          },
        };

  return await prisma.booking.findMany({
    where: filter,
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
    },
  });
};

const getBookingByIdFromDB = async (
  bookingId: string,
  userId: string,
  role: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  if (!booking)
    throw new AppError(httpStatus.NOT_FOUND, 'Booking record missing.');

  if (role === 'CUSTOMER' && booking.customerId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access unauthorized.');
  }

  return booking;
};

export const bookingService = {
  createBookingInDB,
  getUserBookingsFromDB,
  getBookingByIdFromDB,
};
