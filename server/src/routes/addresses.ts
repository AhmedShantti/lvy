import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

export const addressesRouter = Router();
addressesRouter.use(requireAuth);

const addressSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().min(1),
  postal: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(1),
  isDefault: z.boolean().optional(),
});

addressesRouter.get("/", async (req, res, next) => {
  try {
    const items = await prisma.address.findMany({
      where: { userId: req.user!.sub },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
    res.json({ items });
  } catch (e) { next(e); }
});

addressesRouter.post("/", async (req, res, next) => {
  try {
    const data = addressSchema.parse(req.body);
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.sub }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { ...data, userId: req.user!.sub },
    });
    res.status(201).json({ address });
  } catch (e) { next(e); }
});

addressesRouter.put("/:id", async (req, res, next) => {
  try {
    const data = addressSchema.partial().parse(req.body);
    // Ensure the address belongs to the user before updating.
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.sub } });
    if (!existing) throw new HttpError(404, "Address not found");
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.sub }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({ where: { id: existing.id }, data });
    res.json({ address });
  } catch (e) { next(e); }
});

addressesRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user!.sub } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
