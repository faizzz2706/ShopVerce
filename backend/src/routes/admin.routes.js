import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate, authorize } from "../middleware/auth.js";
import * as admin from "../controllers/admin.controller.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", asyncHandler(admin.getDashboardStats));
router.get("/users", asyncHandler(admin.getUsers));
router.patch("/users/:id/role", asyncHandler(admin.updateUserRole));
router.delete("/users/:id", asyncHandler(admin.deleteUser));
router.get("/products", asyncHandler(admin.adminGetProducts));
router.get("/products/:id", asyncHandler(admin.getAdminProduct));
router.post("/products", asyncHandler(admin.createProduct));
router.patch("/products/:id", asyncHandler(admin.updateProduct));
router.delete("/products/:id", asyncHandler(admin.deleteProduct));
router.patch("/products/:id/inventory", asyncHandler(admin.updateInventory));
router.get("/orders", asyncHandler(admin.adminGetOrders));
router.patch("/orders/:id/status", asyncHandler(admin.updateOrderStatus));
router.get("/reviews", asyncHandler(admin.adminGetReviews));
router.patch("/reviews/:id/approve", asyncHandler(admin.approveReview));
router.get("/coupons", asyncHandler(admin.adminGetCoupons));
router.post("/coupons", asyncHandler(admin.createCoupon));
router.patch("/coupons/:id", asyncHandler(admin.updateCoupon));
router.get("/categories", asyncHandler(admin.adminGetCategories));
router.post("/categories", asyncHandler(admin.createCategory));
router.post("/subcategories", asyncHandler(admin.createSubCategory));
router.get("/banners", asyncHandler(admin.adminGetBanners));
router.post("/banners", asyncHandler(admin.createBanner));
router.patch("/banners/:id", asyncHandler(admin.updateBanner));
router.patch("/returns/:id", asyncHandler(admin.handleReturnRequest));

export default router;
