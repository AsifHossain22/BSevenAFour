import { prisma } from '../../lib/prisma';
import { stripe } from '../../lib/stripe';
import AppError from '../../utils/appError';
import httpStatus from 'http-status';
import config from '../../config';
import Stripe from 'stripe';
import { BookingStatus, PaymentStatus } from '../../../generated/prisma/enums';

const createPaymentSession = async (userId: string, bookingId: string) => {
  const booking = (await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      service: true,
      customer: true,
    } as any,
  })) as any;

  if (!booking) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Target booking request not found.',
    );
  }

  if (booking.status !== 'ACCEPTED') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Payment cannot be initiated. Booking status is: ${booking.status}. Must be ACCEPTED.`,
    );
  }

  const transactionId = `TXN-${Date.now()}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name:
              booking.service?.name ||
              booking.service?.title ||
              'Service Payment',
          },
          unit_amount: Math.round((booking.service?.price || 0) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/payment-success?txnId=${transactionId}`,
    cancel_url: `${config.app_url}/payment-failed`,
    metadata: {
      userId,
      bookingId,
      transactionId,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId,
      transactionId,
      amount: booking.service?.price || 0,
      status: PaymentStatus.PENDING,
      method: 'STRIPE',
    } as any,
  });

  return { paymentUrl: session.url };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    throw new AppError(httpStatus.BAD_REQUEST, `Webhook error: ${err.message}`);
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
      await prisma.payment.update({
        where: {
          transactionId: transactionId,
        },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
        },
      });

      await prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BookingStatus.PAID,
        },
      });

      console.log(
        `Payment captured for Booking ${bookingId} | Txn: ${transactionId}`,
      );
    } catch (error: any) {
      console.error('DATABASE UPDATE FAILED:', error.message || error);
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Database update error: ${error.message}`,
      );
    }
  }
};

const getUserPaymentHistory = async (userId: string) => {
  return await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId,
      },
    } as any,
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    } as any,
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getPaymentDetails = async (id: string) => {
  return await prisma.payment.findUniqueOrThrow({
    where: { id },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    } as any,
  });
};

export const paymentServices = {
  createPaymentSession,
  handleWebhook,
  getUserPaymentHistory,
  getPaymentDetails,
};
