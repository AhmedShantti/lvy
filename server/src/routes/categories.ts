import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res, next) => {
  try {
    const cats = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    res.json({ items: cats });
  } catch (e) { next(e); }
});
