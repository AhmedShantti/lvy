import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const ordersRouter = Router();

const createSchema = z.object({
  email: z.string().email(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    variant: z.string().optional(),
  })).min(1),
  address: z.object({
    fullName: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    region: z.string(),
    postal: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
  deliveryTier: z.enum(["STANDARD", "EXPRESS", "WHITE_GLOVE"]).default("STANDARD"),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

function genNumber() {
  return "LVY-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

ordersRouter.post("/", optionalAuth, async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map(i => i.productId) } },
    });
    if (products.length !== data.items.length) throw new HttpError(400, "Invalid items");

    let subtotal = 0;
    const orderItems = data.items.map(i => {
      const p = products.find(x => x.id === i.productId)!;
      const price = Number(p.price);
      subtotal += price * i.quantity;
      return {
        productId: p.id, name: p.name, image: p.images[0] ?? null,
        price, quantity: i.quantity, variant: i.variant,
      };
    });

    const shipping = data.deliveryTier === "WHITE_GLOVE" ? 199 :
                     data.deliveryTier === "EXPRESS" ? 60 :
                     subtotal >= 1500 ? 0 : 25;
    const tax = +(subtotal * 0.08).toFixed(2);
    let discount = 0;
    let couponUsed: string | undefined;
    if (data.couponCode) {
      const c = await prisma.coupon.findUnique({ where: { code: data.couponCode } });
      if (c?.active) {
        discount = c.type === "percent" ? +(subtotal * (Number(c.value) / 100)).toFixed(2) : Number(c.value);
        couponUsed = c.code;
      }
    }
    const total = +(subtotal + shipping + tax - discount).toFixed(2);

    const order = await prisma.order.create({
      data: {
        number: genNumber(),
        email: data.email,
        userId: req.user?.sub,
        subtotal, shipping, tax, discount, total,
        deliveryTier: data.deliveryTier,
        couponCode: data.couponCode,
        notes: data.notes,
        items: { create: orderItems },
        shipment: { create: {} },
      },
      include: { items: true, shipment: true },
    });
    if (couponUsed) {
      await prisma.coupon.update({ where: { code: couponUsed }, data: { usedCount: { increment: 1 } } });
    }
    res.json({ order });
  } catch (e) { next(e); }
});

ordersRouter.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      include: { items: true, shipment: true },
    });
    res.json({ items: orders });
  } catch (e) { next(e); }
});

ordersRouter.post("/claim", requireAuth, async (req, res, next) => {
  try {
    const { number, email } = z.object({
      number: z.string(),
      email: z.string().email(),
    }).parse(req.body);

    const order = await prisma.order.findUnique({ where: { number } });
    if (!order) throw new HttpError(404, "Order not found");
    if (order.email.toLowerCase() !== email.toLowerCase()) {
      throw new HttpError(403, "Email does not match the order");
    }
    if (order.userId && order.userId !== req.user!.sub) {
      throw new HttpError(409, "Order is already linked to another account");
    }
    if (order.userId === req.user!.sub) {
      return res.json({ order, alreadyClaimed: true });
    }

    const updated = await prisma.order.update({
      where: { number },
      data: { userId: req.user!.sub },
      include: { items: true, shipment: true },
    });
    res.json({ order: updated });
  } catch (e) { next(e); }
});

ordersRouter.get("/:number", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { number: req.params.number },
      include: { items: true, shipment: true },
    });
    if (!order) throw new HttpError(404, "Order not found");
    res.json({ order });
  } catch (e) { next(e); }
});
