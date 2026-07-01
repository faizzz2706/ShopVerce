import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { updateProductRating } from "./review.controller.js";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getDashboardStats(req, res) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueAgg,
    recentOrders,
    ordersByStatus,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null, role: "CUSTOMER" } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { notIn: ["CANCELLED"] } },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { take: 2 },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") as month, SUM(total) as revenue, COUNT(*)::int as orders
      FROM "Order"
      WHERE "createdAt" >= ${thirtyDaysAgo} AND status NOT IN ('CANCELLED')
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `.catch(() => []),
  ]);

  const lowStock = await prisma.product.findMany({
    where: { deletedAt: null, stock: { lte: 10 } },
    take: 10,
    select: { id: true, name: true, stock: true, sku: true },
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg._sum.total || 0,
      },
      recentOrders,
      ordersByStatus,
      monthlyRevenue,
      lowStock,
    },
  });
}

export async function getUsers(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = { deletedAt: null };
  if (req.query.search) {
    where.OR = [
      { email: { contains: req.query.search, mode: "insensitive" } },
      { firstName: { contains: req.query.search, mode: "insensitive" } },
      { lastName: { contains: req.query.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, ...paginatedResponse(users, total, page, limit) });
}

export async function updateUserRole(req, res) {
  const { role } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, email: true, role: true },
  });
  res.json({ success: true, data: user });
}

export async function deleteUser(req, res) {
  await prisma.user.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });
  res.json({ success: true, message: "User soft deleted" });
}

function parseProductData(body) {
  const {
    name,
    slug,
    description,
    price,
    comparePrice,
    stock,
    sku,
    categoryId,
    subCategoryId,
    featured,
    bestSeller,
    newArrival,
    images,
  } = body;

  if (!name?.trim()) throw new AppError("Product name is required", 400);
  if (!description?.trim()) throw new AppError("Description is required", 400);
  if (!categoryId) throw new AppError("Category is required", 400);
  if (!sku?.trim()) throw new AppError("SKU is required", 400);
  if (price === undefined || price === null || Number(price) < 0) {
    throw new AppError("Valid price is required", 400);
  }
  if (stock === undefined || stock === null || parseInt(stock, 10) < 0) {
    throw new AppError("Valid stock is required", 400);
  }

  return {
    name: name.trim(),
    slug: slug?.trim() || `${slugify(name)}-${Date.now()}`,
    description: description.trim(),
    price,
    comparePrice: comparePrice || null,
    stock: parseInt(stock, 10),
    sku: sku.trim(),
    categoryId,
    subCategoryId: subCategoryId || null,
    featured: Boolean(featured),
    bestSeller: Boolean(bestSeller),
    newArrival: Boolean(newArrival),
    images: Array.isArray(images)
      ? images.filter((img) => img?.url?.trim()).map((img, i) => ({
          url: img.url.trim(),
          alt: img.alt?.trim() || name.trim(),
          sortOrder: i,
        }))
      : [],
  };
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" } },
  category: true,
  subCategory: true,
};

export async function adminGetProducts(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = { deletedAt: null };
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: "insensitive" } },
      { sku: { contains: req.query.search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, ...paginatedResponse(products, total, page, limit) });
}

export async function getAdminProduct(req, res) {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: productInclude,
  });
  if (!product) throw new AppError("Product not found", 404);
  res.json({ success: true, data: product });
}

export async function createProduct(req, res) {
  const parsed = parseProductData(req.body);

  const existingSlug = await prisma.product.findUnique({
    where: { slug: parsed.slug },
  });
  if (existingSlug) {
    parsed.slug = `${parsed.slug}-${Date.now()}`;
  }

  const existingSku = await prisma.product.findUnique({
    where: { sku: parsed.sku },
  });
  if (existingSku) throw new AppError("SKU already exists", 409);

  const { images, ...data } = parsed;

  const product = await prisma.product.create({
    data: {
      ...data,
      images: images.length
        ? { create: images }
        : {
            create: [
              {
                url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
                alt: data.name,
                sortOrder: 0,
              },
            ],
          },
    },
    include: productInclude,
  });

  res.status(201).json({ success: true, data: product });
}

export async function updateProduct(req, res) {
  const existing = await prisma.product.findFirst({
    where: { id: req.params.id, deletedAt: null },
  });
  if (!existing) throw new AppError("Product not found", 404);

  const parsed = parseProductData(req.body);

  if (parsed.sku !== existing.sku) {
    const skuTaken = await prisma.product.findFirst({
      where: { sku: parsed.sku, id: { not: req.params.id } },
    });
    if (skuTaken) throw new AppError("SKU already exists", 409);
  }

  const { images, ...data } = parsed;

  const product = await prisma.$transaction(async (tx) => {
    if (req.body.images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: req.params.id } });
    }

    return tx.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(req.body.images !== undefined && images.length > 0
          ? { images: { create: images } }
          : {}),
      },
      include: productInclude,
    });
  });

  res.json({ success: true, data: product });
}

export async function deleteProduct(req, res) {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });
  res.json({ success: true, message: "Product soft deleted" });
}

export async function updateInventory(req, res) {
  const { stock } = req.body;
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { stock },
  });
  res.json({ success: true, data: product });
}

export async function adminGetOrders(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        items: true,
        payment: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, ...paginatedResponse(orders, total, page, limit) });
}

export async function updateOrderStatus(req, res) {
  const { status, note } = req.body;
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: true,
        items: true,
      },
    });
    await tx.orderStatusHistory.create({
      data: { orderId: req.params.id, status, note },
    });
    await tx.notification.create({
      data: {
        userId: updated.userId,
        type: "ORDER",
        title: "Order status updated",
        message: `Your order ${updated.orderNumber} is now ${status}`,
        link: `/orders/${updated.id}`,
      },
    });
    return updated;
  });
  res.json({ success: true, data: order });
}

export async function adminGetReviews(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const where = {};
  if (req.query.approved !== undefined) {
    where.approved = req.query.approved === "true";
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where }),
  ]);

  res.json({ success: true, ...paginatedResponse(reviews, total, page, limit) });
}

export async function approveReview(req, res) {
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { approved: true },
  });
  await updateProductRating(review.productId);
  res.json({ success: true, data: review });
}

export async function adminGetCoupons(req, res) {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: coupons });
}

export async function createCoupon(req, res) {
  const coupon = await prisma.coupon.create({ data: req.body });
  res.status(201).json({ success: true, data: coupon });
}

export async function updateCoupon(req, res) {
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, data: coupon });
}

export async function adminGetCategories(req, res) {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      subCategories: {
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
}

export async function createCategory(req, res) {
  const { name, description, image } = req.body;
  if (!name?.trim()) throw new AppError("Category name is required", 400);

  const slug = slugify(name);
  const existing = await prisma.category.findFirst({
    where: { deletedAt: null, OR: [{ slug }, { name: name.trim() }] },
  });
  if (existing) throw new AppError("Category already exists", 409);

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      image: image?.trim() || null,
    },
  });
  res.status(201).json({ success: true, data: category });
}

export async function createSubCategory(req, res) {
  const { categoryId, name, description, image } = req.body;
  if (!categoryId) throw new AppError("Category is required", 400);
  if (!name?.trim()) throw new AppError("Subcategory name is required", 400);

  const category = await prisma.category.findFirst({
    where: { id: categoryId, deletedAt: null },
  });
  if (!category) throw new AppError("Category not found", 404);

  const slug = slugify(name);
  const existing = await prisma.subCategory.findFirst({
    where: { categoryId, deletedAt: null, slug },
  });
  if (existing) throw new AppError("Subcategory already exists in this category", 409);

  const sub = await prisma.subCategory.create({
    data: {
      categoryId,
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      image: image?.trim() || null,
    },
  });
  res.status(201).json({ success: true, data: sub });
}

export async function adminGetBanners(req, res) {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  res.json({ success: true, data: banners });
}

export async function createBanner(req, res) {
  const banner = await prisma.banner.create({ data: req.body });
  res.status(201).json({ success: true, data: banner });
}

export async function updateBanner(req, res) {
  const banner = await prisma.banner.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, data: banner });
}

export async function handleReturnRequest(req, res) {
  const { status } = req.body;
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: req.params.id },
    include: { order: true },
  });
  if (!returnReq) throw new AppError("Return request not found", 404);

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.returnRequest.update({
      where: { id: returnReq.id },
      data: { status },
    });
    if (status === "APPROVED") {
      await tx.order.update({
        where: { id: returnReq.orderId },
        data: { status: "RETURNED" },
      });
    }
    return r;
  });

  res.json({ success: true, data: updated });
}
