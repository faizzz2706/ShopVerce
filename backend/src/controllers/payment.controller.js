import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";

let stripe = null;
if (env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY);
}

export async function processPayment({ order, method, userId }) {
  if (method === "stripe" && stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: "inr",
      metadata: { orderId: order.id, userId },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        status: "PROCESSING",
        provider: "STRIPE",
        stripePaymentIntentId: intent.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED" },
    });

    return { ...payment, clientSecret: intent.client_secret };
  }

  const mockId = `mock_${uuidv4()}`;
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: order.total,
      status: "COMPLETED",
      provider: "MOCK",
      mockPaymentId: mockId,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "CONFIRMED" },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: "CONFIRMED",
      note: "Payment confirmed (mock)",
    },
  });

  return payment;
}

export async function confirmStripePayment(req, res) {
  const { paymentIntentId } = req.body;
  if (!stripe) throw new AppError("Stripe not configured", 400);

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!payment) throw new AppError("Payment not found", 404);

  const status = intent.status === "succeeded" ? "COMPLETED" : "FAILED";

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status },
  });

  if (status === "COMPLETED") {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "CONFIRMED" },
    });
  }

  res.json({ success: true, data: updated });
}

export async function createStripeIntent(req, res) {
  const { orderId } = req.body;
  if (!stripe) {
    return res.json({
      success: true,
      data: { mock: true, message: "Use mock payment - Stripe keys not configured" },
    });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user.id },
  });
  if (!order) throw new AppError("Order not found", 404);

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(order.total) * 100),
    currency: "inr",
    metadata: { orderId: order.id },
  });

  res.json({
    success: true,
    data: { clientSecret: intent.client_secret, paymentIntentId: intent.id },
  });
}
