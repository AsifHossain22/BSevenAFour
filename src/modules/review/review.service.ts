import { BookingStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import AppError from '../../utils/appError';
import httpStatus from 'http-status';

const createReview = async (payload: any, customerId: string) => {
  const { bookingId, rating, comment } = payload;

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      service: true,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found!');
  }

  if (booking.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You cannot review a booking that does not belong to you.',
    );
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Reviews can only be submitted once the technician marks the job as COMPLETED (Current status: ${booking.status}).`,
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      bookingId,
    },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already submitted a review for this booking.',
    );
  }

  const serviceId = booking.serviceId;
  const techProfileId = booking.service.techProfileId;

  return await prisma.$transaction(async tx => {
    const review = await tx.review.create({
      data: {
        customerId,
        bookingId,
        rating: Number(rating),
        comment,
      },
    });

    const aggregate = await tx.review.aggregate({
      where: {
        booking: {
          serviceId: booking.serviceId,
        },
      },
      _avg: {
        rating: true,
      },
    });

    const averageRating = aggregate?._avg?.rating;

    if (averageRating !== null && averageRating !== undefined) {
      await tx.service.update({
        where: {
          id: booking.serviceId,
        },
        data: {
          rating: averageRating,
        },
      });
    }

    return review;
  });
};

export const reviewService = {
  createReview,
};
