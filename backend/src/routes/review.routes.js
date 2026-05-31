import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import * as review from "../controllers/review.controller.js";

const router = Router();

router.get("/product/:productId", asyncHandler(review.getProductReviews));
router.post("/", authenticate, asyncHandler(review.createReview));

export default router;
