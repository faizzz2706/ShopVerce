import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/jwt.js";
import {
  sendEmail,
  verificationEmailHtml,
  resetPasswordEmailHtml,
} from "../utils/email.js";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  emailVerified: true,
  avatar: true,
  phone: true,
  createdAt: true,
};

function setTokenCookies(res, accessToken, refreshToken) {
  const isProd = env.NODE_ENV === "production";
  const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  };
  res.cookie("accessToken", accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export async function register(req, res) {
  const { email, password, firstName, lastName, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already registered", 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, firstName, lastName, phone },
    select: userSelect,
  });

  await prisma.cart.create({ data: { userId: user.id } });

  const verifyToken = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token: verifyToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendEmail({
    to: email,
    subject: "Verify your ShopVerse account",
    html: verificationEmailHtml(verifyToken),
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    message: "Registration successful. Please verify your email.",
    data: { user, accessToken, refreshToken },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setTokenCookies(res, accessToken, refreshToken);

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    data: {
      user: {
        id: safeUser.id,
        email: safeUser.email,
        firstName: safeUser.firstName,
        lastName: safeUser.lastName,
        role: safeUser.role,
        emailVerified: safeUser.emailVerified,
        avatar: safeUser.avatar,
        phone: safeUser.phone,
      },
      accessToken,
      refreshToken,
    },
  });
}

export async function refresh(req, res) {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) throw new AppError("Refresh token required", 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401);
  }

  const user = await prisma.user.findFirst({
    where: { id: decoded.userId, deletedAt: null },
    select: userSelect,
  });

  if (!user) throw new AppError("User not found", 401);

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setTokenCookies(res, accessToken, newRefreshToken);

  res.json({
    success: true,
    data: { user, accessToken, refreshToken: newRefreshToken },
  });
}

export async function logout(req, res) {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: resetPasswordEmailHtml(token),
    });
  }

  res.json({
    success: true,
    message: "If an account exists, a reset link has been sent",
  });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;

  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: { token, used: false, expiresAt: { gt: new Date() } },
  });

  if (!resetRecord) throw new AppError("Invalid or expired reset token", 400);

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.update({
    where: { id: resetRecord.id },
    data: { used: true },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: resetRecord.userId } });

  res.json({ success: true, message: "Password reset successful" });
}

export async function verifyEmail(req, res) {
  const { token } = req.body;

  const record = await prisma.emailVerificationToken.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
  });

  if (!record) throw new AppError("Invalid or expired verification token", 400);

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  res.json({ success: true, message: "Email verified successfully" });
}

export async function resendVerification(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (user.emailVerified) {
    throw new AppError("Email already verified", 400);
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    update: {
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: verificationEmailHtml(token),
  });

  res.json({ success: true, message: "Verification email sent" });
}

export async function getMe(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      ...userSelect,
      addresses: { orderBy: { createdAt: "desc" } },
      _count: {
        select: {
          orders: true,
          wishlist: true,
          notifications: { where: { read: false } },
        },
      },
    },
  });

  res.json({ success: true, data: user });
}
