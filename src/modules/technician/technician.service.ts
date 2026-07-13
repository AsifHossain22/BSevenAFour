import { BookingStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import AppError from '../../utils/appError';
import httpStatus from 'http-status';

// UpdateProfileInDB
const updateProfileInDB = async (userId: string, payload: any) => {
  const { skills, experience, pricing } = payload;

  return await prisma.technicianProfile.update({
    where: {
      userId,
    },
    data: {
      skills: Array.isArray(skills) ? skills : [skills],
      experience: experience ? parseInt(experience) : undefined,
      pricing: pricing ? parseInt(pricing) : undefined,
    },
  });
};

// UpdateAvailabilityInDB
const updateAvailabilityInDB = async (userId: string, slots: string[]) => {
  return await prisma.technicianProfile.update({
    where: {
      userId,
    },
    data: {
      availabilitySlots: slots,
    },
  });
};

// GetTechnicianBookingsFromDB
const getTechnicianBookingsFromDB = async (userId: string) => {
  return await prisma.booking.findMany({
    where: {
      service: {
        technician: {
          userId: userId,
        },
      },
    },
  });
};

// UpdateBookingStatusInDB
const updateBookingStatusInDB = async (
  bookingId: string,
  userId: string,
  status: string,
) => {
  const validStatuses = Object.values(BookingStatus) as string[];

  if (!validStatuses.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status code. Options: ${validStatuses.join(', ')}`,
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        include: {
          technician: true,
        },
      },
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking record not found!');
  }

  if (booking.service.technician.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Unauthorized. You do not have permission to update booking record.',
    );
  }

  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: status as BookingStatus,
    },
    include: {
      service: true,
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

export const technicianService = {
  updateProfileInDB,
  updateAvailabilityInDB,
  getTechnicianBookingsFromDB,
  updateBookingStatusInDB,
};
