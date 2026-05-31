import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { calculateCartTotals } from "../utils/cartTotals.js";

const cartInclude = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
  },
};

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }
  return cart;
}

export async function getCart(req, res) {
  const cart = await getOrCreateCart(req.user.id);
  let coupon = null;
  if (req.query.couponCode) {
    coupon = await prisma.coupon.findUnique({
      where: { code: req.query.couponCode.toUpperCase() },
    });
  }
  const totals = calculateCartTotals(cart.items, coupon);
  res.json({ success: true, data: { cart, totals, coupon } });
}

export async function addToCart(req, res) {
  const { productId, quantity = 1 } = req.body;
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });
  if (!product) throw new AppError("Product not found", 404);
  if (product.stock < quantity) throw new AppError("Insufficient stock", 400);

  const cart = await getOrCreateCart(req.user.id);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: { increment: quantity }, savedForLater: false },
  });

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: cartInclude,
  });

  res.json({
    success: true,
    message: "Added to cart",
    data: { cart: updated, totals: calculateCartTotals(updated.items) },
  });
}

export async function updateCartItem(req, res) {
  const { quantity, savedForLater } = req.body;
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.itemId, cart: { userId: req.user.id } },
    include: { product: true },
  });
  if (!item) throw new AppError("Cart item not found", 404);

  if (quantity !== undefined) {
    if (quantity < 1) throw new AppError("Quantity must be at least 1", 400);
    if (item.product.stock < quantity) throw new AppError("Insufficient stock", 400);
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: {
      ...(quantity !== undefined && { quantity }),
      ...(savedForLater !== undefined && { savedForLater }),
    },
  });

  const cart = await getOrCreateCart(req.user.id);
  res.json({
    success: true,
    data: { item: updated, cart, totals: calculateCartTotals(cart.items) },
  });
}

export async function removeFromCart(req, res) {
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.itemId, cart: { userId: req.user.id } },
  });
  if (!item) throw new AppError("Cart item not found", 404);

  await prisma.cartItem.delete({ where: { id: item.id } });
  const cart = await getOrCreateCart(req.user.id);

  res.json({
    success: true,
    message: "Removed from cart",
    data: { cart, totals: calculateCartTotals(cart.items) },
  });
}

export async function clearCart(req, res) {
  const cart = await getOrCreateCart(req.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ success: true, message: "Cart cleared" });
}

export async function validateCoupon(req, res) {
  const { code } = req.body;
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.active) {
    throw new AppError("Invalid coupon", 400);
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new AppError("Coupon expired", 400);
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new AppError("Coupon usage limit reached", 400);
  }

  const cart = await getOrCreateCart(req.user.id);
  const totals = calculateCartTotals(cart.items, coupon);

  res.json({ success: true, data: { coupon, totals } });
}
