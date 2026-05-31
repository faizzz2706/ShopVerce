import { prisma } from "../config/prisma.js";

export async function getBanners(req, res) {
  const where = { active: true };
  if (req.query.position) where.position = req.query.position;

  const banners = await prisma.banner.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });

  res.json({ success: true, data: banners });
}
