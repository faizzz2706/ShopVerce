import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { generateOrderNumber } from "../utils/orderNumber.js";
import { calculateCartTotals } from "../utils/cartTotals.js";
import { processPayment } from "./payment.controller.js";

const orderInclude = {
  items: { include: { product: { include: { images: { take: 1 } } } } },
  payment: true,
  shippingAddress: true,
  billingAddress: true,
  statusHistory: { orderBy: { createdAt: "asc" } },
  coupon: true,
};

export async function getOrders(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = { userId: req.user.id };
  if (req.query.status) where.status = req.query.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, ...paginatedResponse(orders, total, page, limit) });
}

export async function getOrderById(req, res) {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: orderInclude,
  });
  if (!order) throw new AppError("Order not found", 404);
  res.json({ success: true, data: order });
}

export async function createOrder(req, res) {
  const {
    shippingAddressId,
    billingAddressId,
    couponCode,
    notes,
    paymentMethod = "mock",
  } = req.body;

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        where: { savedForLater: false },
        include: { product: true },
      },
    },
  });

  if (!cart?.items.length) {
    throw new AppError("Cart is empty", 400);
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
    }
  }

  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });
    if (!coupon?.active) throw new AppError("Invalid coupon", 400);
  }

  const totals = calculateCartTotals(cart.items, coupon);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        discount: totals.discount,
        total: totals.total,
        couponId: coupon?.id,
        shippingAddressId,
        billingAddressId: billingAddressId || shippingAddressId,
        notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
        statusHistory: {
          create: { status: "PENDING", note: "Order placed" },
        },
      },
      include: orderInclude,
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id, savedForLater: false },
    });

    if (coupon) {
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  const payment = await processPayment({
    order,
    method: paymentMethod,
    userId: req.user.id,
  });

  await prisma.notification.create({
    data: {
      userId: req.user.id,
      type: "ORDER",
      title: "Order placed successfully",
      message: `Your order ${order.orderNumber} has been placed.`,
      link: `/orders/${order.id}`,
    },
  });

  res.status(201).json({
    success: true,
    data: { order: { ...order, payment } },
  });
}

export async function cancelOrder(req, res) {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { items: true },
  });

  if (!order) throw new AppError("Order not found", 404);
  if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
    throw new AppError("Order cannot be cancelled", 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: orderInclude,
    });

    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: "CANCELLED", note: "Cancelled by customer" },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return o;
  });

  res.json({ success: true, data: updated });
}

export async function requestReturn(req, res) {
  const { reason } = req.body;
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id, status: "DELIVERED" },
  });

  if (!order) throw new AppError("Order not eligible for return", 400);

  const returnReq = await prisma.$transaction(async (tx) => {
    const r = await tx.returnRequest.create({
      data: { orderId: order.id, reason },
    });
    await tx.order.update({
      where: { id: order.id },
      data: { status: "RETURN_REQUESTED" },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "RETURN_REQUESTED",
        note: reason,
      },
    });
    return r;
  });

  res.json({ success: true, data: returnReq });
}

export function generateInvoice(order) {
  return {
    invoiceNumber: `INV-${order.orderNumber}`,
    orderNumber: order.orderNumber,
    date: order.createdAt,
    customer: order.userId,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
    status: order.status,
  };
}

export async function getInvoice(req, res) {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { items: true },
  });
  if (!order) throw new AppError("Order not found", 404);
  res.json({ success: true, data: generateInvoice(order) });
}
