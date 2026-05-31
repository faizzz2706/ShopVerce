import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as category from "../controllers/category.controller.js";

const router = Router();

router.get("/", asyncHandler(category.getCategories));
router.get("/:slug", asyncHandler(category.getCategoryBySlug));

export default router;
