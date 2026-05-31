import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export async function getProductReviews(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = { productId: req.params.productId, approved: true };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  res.json({ success: true, ...paginatedResponse(reviews, total, page, limit) });
}

export async function createReview(req, res) {
  const { productId, rating, title, comment } = req.body;

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });
  if (!product) throw new AppError("Product not found", 404);

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });
  if (existing) throw new AppError("You already reviewed this product", 409);

  const review = await prisma.review.create({
    data: {
      userId: req.user.id,
      productId,
      rating,
      title,
      comment,
      approved: false,
    },
  });

  res.status(201).json({
    success: true,
    message: "Review submitted for approval",
    data: review,
  });
}

async function updateProductRating(productId) {
  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
  });
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  await prisma.product.update({
    where: { id: productId },
    data: { averageRating: avg, reviewCount: reviews.length },
  });
}

export { updateProductRating };
