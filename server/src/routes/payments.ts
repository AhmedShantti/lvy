import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error.js";

export const paymentsRouter = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

paymentsRouter.post("/intent", async (req, res, next) => {
  try {
    if (!stripe) throw new HttpError(500, "Stripe not configured");
    const { orderNumber } = z.object({ orderNumber: z.string() }).parse(req.body);
    const order = await prisma.order.findUnique({ where: { number: orderNumber } });
    if (!order) throw new HttpError(404, "Order not found");

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: order.currency.toLowerCase(),
      metadata: { orderNumber: order.number },
      automatic_payment_methods: { enabled: true },
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeId: intent.id } });
    res.json({ clientSecret: intent.client_secret });
  } catch (e) { next(e); }
});

// Webhook — receives raw body via app-level middleware
paymentsRouter.post("/webhook", async (req, res) => {
  if (!stripe) return res.status(500).send("Stripe not configured");
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const number = intent.metadata.orderNumber;
    if (number) {
      await prisma.order.update({
        where: { number },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      });
    }
  }
  res.json({ received: true });
});
