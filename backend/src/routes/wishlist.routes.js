import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import * as wishlist from "../controllers/wishlist.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", asyncHandler(wishlist.getWishlist));
router.post("/", asyncHandler(wishlist.addToWishlist));
router.delete("/:productId", asyncHandler(wishlist.removeFromWishlist));

export default router;
