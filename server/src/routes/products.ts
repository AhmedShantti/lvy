import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.js";

export const productsRouter = Router();

const listQuery = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["new", "price_asc", "price_desc", "rating"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(48).default(12),
  featured: z.coerce.boolean().optional(),
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort, page, limit, featured } = listQuery.parse(req.query);
    const where: any = {};
    if (q) where.name = { contains: q, mode: "insensitive" };
    if (category) where.category = { slug: category };
    if (featured !== undefined) where.featured = featured;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    const orderBy =
      sort === "price_asc" ? { price: "asc" as const } :
      sort === "price_desc" ? { price: "desc" as const } :
      sort === "rating" ? { rating: "desc" as const } :
      { createdAt: "desc" as const };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy,
        skip: (page - 1) * limit, take: limit,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

productsRouter.get("/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        variants: true,
        reviews: { where: { approved: true }, include: { user: { select: { name: true } } } },
      },
    });
    if (!product) throw new HttpError(404, "Product not found");
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, NOT: { id: product.id } },
      take: 4,
    });
    res.json({ product, related });
  } catch (e) { next(e); }
});
