import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  category: { select: { id: true, name: true, slug: true } },
  subCategory: { select: { id: true, name: true, slug: true } },
};

function buildProductWhere(query) {
  const where = { deletedAt: null };

  if (query.category) where.category = { slug: query.category };
  if (query.subCategory) where.subCategory = { slug: query.subCategory };
  if (query.featured === "true") where.featured = true;
  if (query.bestSeller === "true") where.bestSeller = true;
  if (query.newArrival === "true") where.newArrival = true;
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
    if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
  }
  if (query.rating) where.averageRating = { gte: parseFloat(query.rating) };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { sku: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildProductOrder(query) {
  const sort = query.sort || "newest";
  const orderMap = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    "price-asc": { price: "asc" },
    "price-desc": { price: "desc" },
    rating: { averageRating: "desc" },
    popular: { reviewCount: "desc" },
  };
  return orderMap[sort] || orderMap.newest;
}

export async function getProducts(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = buildProductWhere(req.query);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: buildProductOrder(req.query),
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    ...paginatedResponse(products, total, page, limit),
  });
}

export async function getProductBySlug(req, res) {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, deletedAt: null },
    include: {
      ...productInclude,
      reviews: {
        where: { approved: true },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
      },
    },
  });

  if (!product) throw new AppError("Product not found", 404);

  if (req.user) {
    await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: { userId: req.user.id, productId: product.id },
      },
      create: { userId: req.user.id, productId: product.id },
      update: { viewedAt: new Date() },
    });
  }

  const related = await prisma.product.findMany({
    where: {
      deletedAt: null,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { images: { take: 1 }, category: true },
    take: 8,
  });

  res.json({ success: true, data: { product, related } });
}

export async function getFeatured(req, res) {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, featured: true },
    include: productInclude,
    take: 12,
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: products });
}

export async function getBestSellers(req, res) {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, bestSeller: true },
    include: productInclude,
    take: 12,
    orderBy: { reviewCount: "desc" },
  });
  res.json({ success: true, data: products });
}

export async function getNewArrivals(req, res) {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, newArrival: true },
    include: productInclude,
    take: 12,
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: products });
}

export async function getRecentlyViewed(req, res) {
  const items = await prisma.recentlyViewed.findMany({
    where: { userId: req.user.id },
    orderBy: { viewedAt: "desc" },
    take: 12,
    include: { product: { include: productInclude } },
  });
  res.json({
    success: true,
    data: items.map((i) => i.product),
  });
}
