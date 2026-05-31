import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import * as order from "../controllers/order.controller.js";
import * as payment from "../controllers/payment.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", asyncHandler(order.getOrders));
router.get("/:id", asyncHandler(order.getOrderById));
router.get("/:id/invoice", asyncHandler(order.getInvoice));
router.post("/", asyncHandler(order.createOrder));
router.patch("/:id/cancel", asyncHandler(order.cancelOrder));
router.post("/:id/return", asyncHandler(order.requestReturn));
router.post("/payment/stripe-intent", asyncHandler(payment.createStripeIntent));
router.post("/payment/confirm", asyncHandler(payment.confirmStripePayment));

export default router;
