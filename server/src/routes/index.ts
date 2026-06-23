import { Router } from "express";
import { authRouter } from "./auth.js";
import { productsRouter } from "./products.js";
import { categoriesRouter } from "./categories.js";
import { cartRouter } from "./cart.js";
import { addressesRouter } from "./addresses.js";
import { ordersRouter } from "./orders.js";
import { paymentsRouter } from "./payments.js";
import { adminRouter } from "./admin.js";
import { shippingRouter } from "./shipping.js";
import { reviewsRouter } from "./reviews.js";
import { contentRouter } from "./content.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/cart", cartRouter);
router.use("/addresses", addressesRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/shipping", shippingRouter);
router.use("/reviews", reviewsRouter);
router.use("/content", contentRouter);
router.use("/admin", adminRouter);
