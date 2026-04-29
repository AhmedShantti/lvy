import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const cartRouter = Router();
cartRouter.use(requireAuth);

cartRouter.get("/", async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.sub },
      include: { product: true },
    });
    res.json({ items });
  } catch (e) { next(e); }
});

cartRouter.post("/", async (req, res, next) => {
  try {
    const { productId, quantity, variant } = z.object({
      productId: z.string(),
      quantity: z.number().int().min(1).default(1),
      variant: z.string().optional(),
    }).parse(req.body);
    const item = await prisma.cartItem.upsert({
      where: { userId_productId_variant: { userId: req.user!.sub, productId, variant: variant ?? null as any } },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user!.sub, productId, quantity, variant },
    });
    res.json({ item });
  } catch (e) { next(e); }
});

cartRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
