import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as banner from "../controllers/banner.controller.js";

const router = Router();
router.get("/", asyncHandler(banner.getBanners));

export default router;
