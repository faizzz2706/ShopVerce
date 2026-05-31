import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import * as product from "../controllers/product.controller.js";

const router = Router();

router.get("/", asyncHandler(product.getProducts));
router.get("/featured", asyncHandler(product.getFeatured));
router.get("/best-sellers", asyncHandler(product.getBestSellers));
router.get("/new-arrivals", asyncHandler(product.getNewArrivals));
router.get("/recently-viewed", authenticate, asyncHandler(product.getRecentlyViewed));
router.get("/:slug", optionalAuth, asyncHandler(product.getProductBySlug));

export default router;
