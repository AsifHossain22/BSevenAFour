import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { paymentServices } from './payment.service';
import AppError from '../../utils/appError';

// CreatePaymentSession
const createPaymentSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { bookingId } = req.body;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required.');
  }
  if (!bookingId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Missing bookingId in request body.',
    );
  }

  const result = await paymentServices.createPaymentSession(userId, bookingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Payment checkout session initialized successfully!',
    data: result,
  });
});

// StripeWebhookHandler
const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];

  if (!signature || Array.isArray(signature)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Missing or invalid Stripe signature header.',
    );
  }

  const payload = req.body;

  if (!payload || !Buffer.isBuffer(payload)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Raw body payload is missing or invalid Buffer.',
    );
  }

  await paymentServices.handleWebhook(payload, signature);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment webhook event verified and processed.',
    data: null,
  });
});

// UserPaymentHistory
const getUserPaymentHistory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Authentication required.');
    }

    const result = await paymentServices.getUserPaymentHistory(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Payment history retrieved successfully.',
      data: result,
    });
  },
);

// PaymentDetails
const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await paymentServices.getPaymentDetails(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment transaction details retrieved.',
    data: result,
  });
});

export const paymentController = {
  createPaymentSession,
  handleStripeWebhook,
  getUserPaymentHistory,
  getPaymentDetails,
};
