import { Router } from "express";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { DEFAULT_HOME_SECTIONS, DEFAULT_SETTINGS } from "../lib/defaultContent.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const [orders, customers, products, revenue] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    ]);
    res.json({ orders, customers, products, revenue: revenue._sum.total ?? 0 });
  } catch (e) { next(e); }
});

const productSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number(),
  compareAt: z.number().optional(),
  images: z.array(z.string()),
  categoryId: z.string(),
  stock: z.number().int().default(0),
  material: z.string().optional(),
  color: z.string().optional(),
  dimensions: z.string().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
});

adminRouter.post("/products", async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.json({ product });
  } catch (e) { next(e); }
});

adminRouter.put("/products/:id", async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json({ product });
  } catch (e) { next(e); }
});

adminRouter.delete("/products/:id", async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

adminRouter.get("/orders", async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, shipment: true },
      take: 100,
    });
    res.json({ items: orders });
  } catch (e) { next(e); }
});

adminRouter.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(["PENDING","CONFIRMED","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED","REFUNDED"]),
    }).parse(req.body);
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json({ order });
  } catch (e) { next(e); }
});

// ═════ Reviews moderation ═════
adminRouter.get("/reviews", async (req, res, next) => {
  try {
    const status = (req.query.status as string) ?? "pending";
    const where =
      status === "pending" ? { approved: false } :
      status === "approved" ? { approved: true } :
      {};
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true, images: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json({ items: reviews });
  } catch (e) { next(e); }
});

async function recomputeProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: agg._avg.rating ?? 0 },
  });
}

adminRouter.patch("/reviews/:id/approve", async (req, res, next) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { approved: true },
    });
    await recomputeProductRating(review.productId);
    res.json({ review });
  } catch (e) { next(e); }
});

adminRouter.delete("/reviews/:id", async (req, res, next) => {
  try {
    const review = await prisma.review.delete({ where: { id: req.params.id } });
    await recomputeProductRating(review.productId);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ═════ Order detail + refund ═════
adminRouter.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        shipment: true,
        address: true,
        user: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });
    if (!order) throw new HttpError(404, "Order not found");
    res.json({ order });
  } catch (e) { next(e); }
});

adminRouter.post("/orders/:id/refund", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new HttpError(404, "Order not found");
    // NOTE: In production, call Stripe here with order.stripeId
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
    });
    res.json({ order: updated });
  } catch (e) { next(e); }
});

// ═════ Customers ═════
adminRouter.get("/customers", async (req, res, next) => {
  try {
    const { q, page, limit } = z.object({
      q: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(25),
    }).parse(req.query);
    const where: any = { role: "CUSTOMER" };
    if (q) where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { orders: true, reviews: true } },
          orders: { select: { total: true, paymentStatus: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    const shaped = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      reviewCount: c._count.reviews,
      lifetimeValue: c.orders
        .filter((o) => o.paymentStatus === "PAID")
        .reduce((s, o) => s + Number(o.total), 0),
    }));
    res.json({ items: shaped, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

adminRouter.get("/customers/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: { items: true },
        },
        addresses: true,
        reviews: { include: { product: { select: { name: true, slug: true } } } },
      },
    });
    if (!user) throw new HttpError(404, "Customer not found");
    res.json({ customer: user });
  } catch (e) { next(e); }
});

// ═════ Categories CRUD ═════
const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
});

adminRouter.post("/categories", async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const cat = await prisma.category.create({ data });
    res.status(201).json({ category: cat });
  } catch (e) { next(e); }
});

adminRouter.put("/categories/:id", async (req, res, next) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const cat = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json({ category: cat });
  } catch (e) { next(e); }
});

adminRouter.delete("/categories/:id", async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ═════ Coupons CRUD ═════
const couponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive(),
  minTotal: z.number().optional(),
  expiresAt: z.string().datetime().optional(),
  active: z.boolean().default(true),
});

adminRouter.get("/coupons", async (_req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });
    res.json({ items: coupons });
  } catch (e) { next(e); }
});

adminRouter.post("/coupons", async (req, res, next) => {
  try {
    const data = couponSchema.parse(req.body);
    const coupon = await prisma.coupon.create({
      data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
    });
    res.status(201).json({ coupon });
  } catch (e) { next(e); }
});

adminRouter.put("/coupons/:id", async (req, res, next) => {
  try {
    const data = couponSchema.partial().parse(req.body);
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined },
    });
    res.json({ coupon });
  } catch (e) { next(e); }
});

adminRouter.delete("/coupons/:id", async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ═════ Orders pagination + search (enhanced) ═════
adminRouter.get("/orders-paged", async (req, res, next) => {
  try {
    const { q, status, page, limit } = z.object({
      q: z.string().optional(),
      status: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    }).parse(req.query);
    const where: any = {};
    if (q) where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where, orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit, take: limit,
        include: { items: true },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

// ═════ Orders CSV export ═════
adminRouter.get("/orders.csv", async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 1000,
    });
    const rows = [
      ["number", "date", "email", "status", "paymentStatus", "items", "subtotal", "shipping", "tax", "discount", "total"].join(","),
      ...orders.map((o) =>
        [
          o.number,
          o.createdAt.toISOString(),
          o.email,
          o.status,
          o.paymentStatus,
          o.items.reduce((s, i) => s + i.quantity, 0),
          o.subtotal,
          o.shipping,
          o.tax,
          o.discount,
          o.total,
        ].join(",")
      ),
    ];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="lvy-orders-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(rows.join("\n"));
  } catch (e) { next(e); }
});

// ═════ Order notes edit ═════
adminRouter.patch("/orders/:id/notes", async (req, res, next) => {
  try {
    const { notes } = z.object({ notes: z.string().max(1000) }).parse(req.body);
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { notes } });
    res.json({ order });
  } catch (e) { next(e); }
});

// ═════ Bulk approve reviews ═════
adminRouter.post("/reviews/bulk-approve", async (req, res, next) => {
  try {
    const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body);
    const reviews = await prisma.review.findMany({ where: { id: { in: ids } } });
    await prisma.review.updateMany({ where: { id: { in: ids } }, data: { approved: true } });
    const productIds = [...new Set(reviews.map((r) => r.productId))];
    for (const pid of productIds) await recomputeProductRating(pid);
    res.json({ ok: true, count: reviews.length });
  } catch (e) { next(e); }
});

// ═════ Media (list files from client/public) ═════
adminRouter.get("/media", async (_req, res, next) => {
  try {
    const publicDir = path.resolve(process.cwd(), "../client/public");
    const entries = await fs.readdir(publicDir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(e.name))
      .map((e) => ({ name: e.name, url: `/${e.name}` }));
    res.json({ items: files });
  } catch (e) { next(e); }
});

// ═════ Variants CRUD ═════
const variantSchema = z.object({
  productId: z.string(),
  name: z.string(),
  sku: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.number(),
  stock: z.number().int().default(0),
});

adminRouter.get("/variants", async (req, res, next) => {
  try {
    const { productId } = z.object({ productId: z.string() }).parse(req.query);
    const items = await prisma.productVariant.findMany({ where: { productId } });
    res.json({ items });
  } catch (e) { next(e); }
});

adminRouter.post("/variants", async (req, res, next) => {
  try {
    const data = variantSchema.parse(req.body);
    const variant = await prisma.productVariant.create({ data });
    res.status(201).json({ variant });
  } catch (e) { next(e); }
});

adminRouter.put("/variants/:id", async (req, res, next) => {
  try {
    const data = variantSchema.partial().parse(req.body);
    const variant = await prisma.productVariant.update({ where: { id: req.params.id }, data });
    res.json({ variant });
  } catch (e) { next(e); }
});

adminRouter.delete("/variants/:id", async (req, res, next) => {
  try {
    await prisma.productVariant.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ═════ Settings ═════
adminRouter.get("/settings", async (_req, res, next) => {
  try {
    const rows = await prisma.setting.findMany();
    const map: Record<string, any> = { ...DEFAULT_SETTINGS };
    for (const r of rows) map[r.key] = r.value;
    res.json({ settings: map });
  } catch (e) { next(e); }
});

adminRouter.put("/settings", async (req, res, next) => {
  try {
    const body = req.body as Record<string, any>;
    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ═════ Content (pages + sections) ═════
adminRouter.get("/content/pages", async (_req, res, next) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { sections: true } } },
    });
    res.json({ items: pages });
  } catch (e) { next(e); }
});

adminRouter.get("/content/pages/:slug", async (req, res, next) => {
  try {
    let page = await prisma.page.findUnique({
      where: { slug: req.params.slug },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    if (!page && req.params.slug === "home") {
      page = await prisma.page.create({
        data: {
          slug: "home", title: "Home",
          sections: { create: DEFAULT_HOME_SECTIONS.map((s) => ({ type: s.type, order: s.order, enabled: s.enabled, data: s.data as any })) },
        },
        include: { sections: { orderBy: { order: "asc" } } },
      });
    }
    if (!page) throw new HttpError(404, "Page not found");
    res.json({ page });
  } catch (e) { next(e); }
});

adminRouter.put("/content/sections/:id", async (req, res, next) => {
  try {
    const { data, enabled, order } = req.body;
    const section = await prisma.section.update({
      where: { id: req.params.id },
      data: {
        ...(data !== undefined ? { data } : {}),
        ...(enabled !== undefined ? { enabled } : {}),
        ...(order !== undefined ? { order } : {}),
      },
    });
    res.json({ section });
  } catch (e) { next(e); }
});

adminRouter.post("/content/pages/:slug/reset", async (req, res, next) => {
  try {
    if (req.params.slug !== "home") throw new HttpError(400, "Only home page has defaults");
    await prisma.page.deleteMany({ where: { slug: "home" } });
    const page = await prisma.page.create({
      data: {
        slug: "home", title: "Home",
        sections: { create: DEFAULT_HOME_SECTIONS.map((s) => ({ type: s.type, order: s.order, enabled: s.enabled, data: s.data as any })) },
      },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    res.json({ page });
  } catch (e) { next(e); }
});

// ═════ Enhanced stats with time-series for dashboard charts ═════
adminRouter.get("/stats/timeseries", async (req, res, next) => {
  try {
    const days = Math.max(7, Math.min(365, Number(req.query.days) || 30));
    const now = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start }, paymentStatus: "PAID" },
      select: { createdAt: true, total: true },
    });

    // bucket by day
    const buckets: Record<string, { revenue: number; orders: number }> = {};
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { revenue: 0, orders: 0 };
    }
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (!buckets[key]) continue;
      buckets[key].revenue += Number(o.total);
      buckets[key].orders += 1;
    }

    const series = Object.entries(buckets).map(([date, v]) => ({ date, ...v }));

    // top products
    const topItems = await prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // orders by status
    const byStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    // low stock
    const lowStock = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, slug: true, stock: true, images: true },
      orderBy: { stock: "asc" },
      take: 10,
    });

    res.json({ series, topItems, byStatus, lowStock });
  } catch (e) { next(e); }
});
