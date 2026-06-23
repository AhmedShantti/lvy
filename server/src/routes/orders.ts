import { Router } from "express";
import { z } from "zod";
import { randomBytes } from "crypto";
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
  // High-entropy, unguessable suffix so a guest order number doubles as its access secret
  // (prevents enumeration of others' orders). crypto.randomBytes, not Math.random.
  const rand = randomBytes(6).toString("hex").toUpperCase(); // 12 hex chars
  return "LVY-" + Date.now().toString(36).toUpperCase() + "-" + rand;
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

    // Create the order, verify + decrement stock, and bump coupon usage atomically.
    const order = await prisma.$transaction(async (tx) => {
      // Re-check stock inside the transaction to avoid overselling.
      const fresh = await tx.product.findMany({
        where: { id: { in: data.items.map((i) => i.productId) } },
        select: { id: true, name: true, stock: true },
      });
      for (const i of data.items) {
        const p = fresh.find((x) => x.id === i.productId);
        if (!p || p.stock < i.quantity) {
          throw new HttpError(400, `${p?.name ?? "An item"} is out of stock${p ? ` (only ${p.stock} left)` : ""}`);
        }
      }

      const created = await tx.order.create({
        data: {
          number: genNumber(),
          email: data.email,
          userId: req.user?.sub,
          currency: "EGP",
          subtotal, shipping, tax, discount, total,
          deliveryTier: data.deliveryTier,
          couponCode: data.couponCode,
          notes: data.notes,
          items: { create: orderItems },
          shipment: { create: {} },
        },
        include: { items: true, shipment: true },
      });

      for (const i of data.items) {
        await tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } });
      }
      if (couponUsed) {
        await tx.coupon.update({ where: { code: couponUsed }, data: { usedCount: { increment: 1 } } });
      }
      return created;
    });

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

ordersRouter.get("/:number", optionalAuth, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { number: String(req.params.number) },
      include: { items: true, shipment: true },
    });
    if (!order) throw new HttpError(404, "Order not found");
    // Orders linked to an account require that account; guest orders are reachable
    // only via their unguessable order number (acts as a bearer secret).
    if (order.userId && order.userId !== req.user?.sub) {
      throw new HttpError(403, "Forbidden");
    }
    res.json({ order });
  } catch (e) { next(e); }
});
