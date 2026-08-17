import { prisma } from '../../lib/prisma';
import { stripe } from '../../lib/stripe';
import AppError from '../../utils/appError';
import httpStatus from 'http-status';
import Stripe from 'stripe';
import { BookingStatus, PaymentStatus } from '../../../generated/prisma/enums';
import config from '../../config';

// CreatePaymentSession
const createPaymentSession = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: true,
    },
  });

  if (!booking) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Target booking request not found.',
    );
  }

  if (booking.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have permission to pay for this booking.',
    );
  }

  if (booking.status === BookingStatus.PAID) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This booking has already been paid for.',
    );
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Payment cannot be initiated. Booking status is: ${booking.status}. Must be ACCEPTED.`,
    );
  }

  const transactionId = `TXN-${Date.now()}`;
  const amountNumber = booking.service?.price
    ? Number(booking.service.price)
    : 0;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: booking.service?.title || 'Service Payment',
          },
          unit_amount: Math.round(amountNumber * 100), // convert to cents
        },
        quantity: 1,
      },
    ],
    success_url: `${config.frontend_url}/payment-success?txnId=${transactionId}`,
    cancel_url: `${config.frontend_url}/payment-failed`,
    metadata: {
      userId,
      bookingId,
      transactionId,
    },
  });

  // SavePendingPaymentState
  await prisma.payment.create({
    data: {
      bookingId,
      transactionId,
      amount: amountNumber,
      status: PaymentStatus.PENDING,
      method: 'STRIPE',
    },
  });

  return { paymentUrl: session.url };
};

// HandleStripeWebhook
const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook Signature Error: ${err.message}`,
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const transactionId = session.metadata?.transactionId;

    if (!bookingId || !transactionId) {
      console.warn(
        'Webhook: Session missing metadata bookingId or transactionId.',
      );
      return;
    }

    try {
      const existingBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!existingBooking) {
        console.warn(
          `Webhook ignored: Booking ID "${bookingId}" not found in database.`,
        );
        return;
      }

      // AtomicallyUpdateBothPaymentAndBookingRecord
      await prisma.$transaction([
        prisma.payment.updateMany({
          where: { transactionId },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.PAID,
          },
        }),
      ]);

      console.log(
        `Payment captured successfully for Booking ${bookingId} | Txn: ${transactionId}`,
      );
    } catch (error: any) {
      console.error('DATABASE UPDATE FAILED:', error.message || error);
      return;
    }
  }
};

// GetUserPaymentHistory
const getUserPaymentHistory = async (userId: string) => {
  return await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// GetPaymentDetails
const getPaymentDetails = async (id: string) => {
  return await prisma.payment.findUniqueOrThrow({
    where: { id },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });
};

export const paymentServices = {
  createPaymentSession,
  handleWebhook,
  getUserPaymentHistory,
  getPaymentDetails,
};
