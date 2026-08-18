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

  const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const amountNumber = booking.service?.price
    ? Number(booking.service.price)
    : 0;

  // SafeConversionToCents
  const unitAmountInCents = Math.round((amountNumber + Number.EPSILON) * 100);

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
          unit_amount: unitAmountInCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${config.frontend_url}/payment-success?txnId=${transactionId}`,
    cancel_url: `${config.frontend_url}/payment-failed?txnId=${transactionId}`,
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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handlePaymentSuccess(session);
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handlePaymentFailure(session, 'Session expired');
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailure(paymentIntent);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

// HandlePaymentSuccess
const handlePaymentSuccess = async (session: Stripe.Checkout.Session) => {
  const bookingId = session.metadata?.bookingId;
  const transactionId = session.metadata?.transactionId;

  if (!bookingId || !transactionId) {
    console.warn(
      'Webhook: Session missing metadata bookingId or transactionId.',
    );
    return;
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { transactionId },
  });

  if (!existingPayment) {
    console.warn(
      `Webhook ignored: Payment transaction "${transactionId}" not found.`,
    );
    return;
  }

  // IdempotencyCheck
  if (existingPayment.status === PaymentStatus.COMPLETED) {
    console.log(
      `Webhook skipped: Transaction ${transactionId} is already marked COMPLETED.`,
    );
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { transactionId },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        gatewayResponse: JSON.stringify(session),
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
};

// HandlePaymentFailureOrExpiration
const handlePaymentFailure = async (
  session: Stripe.Checkout.Session,
  reason: string,
) => {
  const transactionId = session.metadata?.transactionId;
  if (!transactionId) return;

  const existingPayment = await prisma.payment.findUnique({
    where: { transactionId },
  });

  if (existingPayment && existingPayment.status === PaymentStatus.PENDING) {
    await prisma.payment.update({
      where: { transactionId },
      data: {
        status: PaymentStatus.FAILED,
        gatewayResponse: JSON.stringify({ reason, session }),
      },
    });
    console.log(
      `Payment marked FAILED for Txn: ${transactionId} | Reason: ${reason}`,
    );
  }
};

// HandlePaymentIntentFailure
const handlePaymentIntentFailure = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  const transactionId = paymentIntent.metadata?.transactionId;
  if (!transactionId) return;

  const existingPayment = await prisma.payment.findUnique({
    where: { transactionId },
  });

  if (existingPayment && existingPayment.status === PaymentStatus.PENDING) {
    await prisma.payment.update({
      where: { transactionId },
      data: {
        status: PaymentStatus.FAILED,
        gatewayResponse: JSON.stringify(paymentIntent.last_payment_error),
      },
    });
    console.log(`Payment Intent marked FAILED for Txn: ${transactionId}`);
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
