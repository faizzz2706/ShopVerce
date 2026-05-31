import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import * as auth from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", authLimiter, registerValidator, validate, asyncHandler(auth.register));
router.post("/login", authLimiter, loginValidator, validate, asyncHandler(auth.login));
router.post("/refresh", asyncHandler(auth.refresh));
router.post("/logout", asyncHandler(auth.logout));
router.post("/forgot-password", authLimiter, asyncHandler(auth.forgotPassword));
router.post("/reset-password", resetPasswordValidator, validate, asyncHandler(auth.resetPassword));
router.post("/verify-email", asyncHandler(auth.verifyEmail));
router.post("/resend-verification", authenticate, asyncHandler(auth.resendVerification));
router.get("/me", authenticate, asyncHandler(auth.getMe));

export default router;
