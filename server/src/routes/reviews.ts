import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const reviewsRouter = Router();

const createSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(1).max(2000),
});

reviewsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const userId = req.user!.sub;

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new HttpError(404, "Product not found");

    const existing = await prisma.review.findFirst({
      where: { productId: data.productId, userId },
    });
    if (existing) throw new HttpError(409, "You already reviewed this piece");

    const review = await prisma.review.create({
      data: { ...data, userId, approved: false },
      include: { user: { select: { name: true } } },
    });

    res.status(201).json({ review });
  } catch (e) { next(e); }
});

reviewsRouter.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user!.sub },
      include: { product: { select: { name: true, slug: true, images: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items: reviews });
  } catch (e) { next(e); }
});
