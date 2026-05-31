import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import * as user from "../controllers/user.controller.js";

const router = Router();
router.use(authenticate);

router.get("/dashboard", asyncHandler(user.getDashboard));
router.patch("/profile", asyncHandler(user.updateProfile));
router.patch("/password", asyncHandler(user.changePassword));
router.get("/addresses", asyncHandler(user.getAddresses));
router.post("/addresses", asyncHandler(user.createAddress));
router.patch("/addresses/:id", asyncHandler(user.updateAddress));
router.delete("/addresses/:id", asyncHandler(user.deleteAddress));
router.get("/notifications", asyncHandler(user.getNotifications));
router.patch("/notifications/:id/read", asyncHandler(user.markNotificationRead));
router.patch("/notifications/read-all", asyncHandler(user.markAllNotificationsRead));

export default router;
