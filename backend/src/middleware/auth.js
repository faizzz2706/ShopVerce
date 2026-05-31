import { prisma } from "../config/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";
import { asyncHandler } from "./errorHandler.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.accessToken;

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await prisma.user.findFirst({
    where: { id: decoded.userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      avatar: true,
      phone: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError("Insufficient permissions", 403);
    }
    next();
  });

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.accessToken;

  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId, deletedAt: null },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });
    if (user) req.user = user;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
});
