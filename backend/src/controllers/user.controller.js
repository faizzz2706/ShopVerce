import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

export async function updateProfile(req, res) {
  const { firstName, lastName, phone, avatar } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone, avatar },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true,
      emailVerified: true,
    },
  });
  res.json({ success: true, data: user });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError("Current password is incorrect", 400);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });

  res.json({ success: true, message: "Password updated successfully" });
}

export async function getAddresses(req, res) {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  res.json({ success: true, data: addresses });
}

export async function createAddress(req, res) {
  const data = { ...req.body, userId: req.user.id };
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id, type: data.type },
      data: { isDefault: false },
    });
  }
  const address = await prisma.address.create({ data });
  res.status(201).json({ success: true, data: address });
}

export async function updateAddress(req, res) {
  const address = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!address) throw new AppError("Address not found", 404);

  if (req.body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user.id, type: address.type },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id: address.id },
    data: req.body,
  });
  res.json({ success: true, data: updated });
}

export async function deleteAddress(req, res) {
  const address = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!address) throw new AppError("Address not found", 404);
  await prisma.address.delete({ where: { id: address.id } });
  res.json({ success: true, message: "Address deleted" });
}

export async function getNotifications(req, res) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ success: true, data: notifications });
}

export async function markNotificationRead(req, res) {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { read: true },
  });
  res.json({ success: true, message: "Notification marked as read" });
}

export async function markAllNotificationsRead(req, res) {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });
  res.json({ success: true, message: "All notifications marked as read" });
}

export async function getDashboard(req, res) {
  const [orderCount, wishlistCount, unreadNotifications, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { userId: req.user.id } }),
      prisma.wishlistItem.count({ where: { userId: req.user.id } }),
      prisma.notification.count({
        where: { userId: req.user.id, read: false },
      }),
      prisma.order.findMany({
        where: { userId: req.user.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: { take: 2 } },
      }),
    ]);

  res.json({
    success: true,
    data: {
      orderCount,
      wishlistCount,
      unreadNotifications,
      recentOrders,
    },
  });
}
