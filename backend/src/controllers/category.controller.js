import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

export async function getCategories(req, res) {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      subCategories: { where: { deletedAt: null } },
      _count: { select: { products: { where: { deletedAt: null } } } },
    },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: categories });
}

export async function getCategoryBySlug(req, res) {
  const category = await prisma.category.findFirst({
    where: { slug: req.params.slug, deletedAt: null },
    include: { subCategories: { where: { deletedAt: null } } },
  });
  if (!category) throw new AppError("Category not found", 404);
  res.json({ success: true, data: category });
}
