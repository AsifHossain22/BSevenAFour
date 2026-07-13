import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import AppError from '../../utils/appError';
import { reviewService } from './review.service';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;

  if (!customerId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Unauthorized! You have no permission to create review.',
    );
  }

  const { rating, comment, bookingId } = req.body;

  if (!bookingId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A target booking ID is required to leave a review.',
    );
  }
  if (rating === undefined || rating < 1 || rating > 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Rating must be a numeric value between 1 and 5.',
    );
  }

  const result = await reviewService.createReview(
    { bookingId, rating, comment },
    customerId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Your review has been submitted successfully!',
    data: result,
  });
});

export const reviewController = {
  createReview,
};
