import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

const wishlistInclude = {
  product: {
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  },
};

export async function getWishlist(req, res) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: wishlistInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: items });
}

export async function addToWishlist(req, res) {
  const { productId } = req.body;
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
  });
  if (!product) throw new AppError("Product not found", 404);

  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    create: { userId: req.user.id, productId },
    update: {},
    include: wishlistInclude,
  });

  res.status(201).json({ success: true, data: item });
}

export async function removeFromWishlist(req, res) {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user.id, productId: req.params.productId },
  });
  res.json({ success: true, message: "Removed from wishlist" });
}
