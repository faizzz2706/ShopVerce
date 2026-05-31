import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import * as cart from "../controllers/cart.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", asyncHandler(cart.getCart));
router.post("/items", asyncHandler(cart.addToCart));
router.patch("/items/:itemId", asyncHandler(cart.updateCartItem));
router.delete("/items/:itemId", asyncHandler(cart.removeFromCart));
router.delete("/", asyncHandler(cart.clearCart));
router.post("/coupon/validate", asyncHandler(cart.validateCoupon));

export default router;
