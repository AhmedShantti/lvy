import { Router } from "express";
import { z } from "zod";

export const shippingRouter = Router();

// Simple zone calculation by postal prefix
shippingRouter.post("/quote", (req, res, next) => {
  try {
    const { postal, subtotal } = z.object({ postal: z.string(), subtotal: z.number() }).parse(req.body);
    const prefix = postal.slice(0, 1);
    const base = ["0", "1"].includes(prefix) ? 25 : 45;
    const free = subtotal >= 1500;
    res.json({
      standard: free ? 0 : base,
      express: free ? base : base + 35,
      whiteGlove: 199,
      etaDays: { standard: "5-8", express: "2-3", whiteGlove: "7-14" },
    });
  } catch (e) { next(e); }
});
