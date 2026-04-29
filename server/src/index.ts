import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.js";
import { router } from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));

// Stripe webhooks need raw body — mount BEFORE json parser
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

app.use(rateLimit({ windowMs: 60_000, max: 200 }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "lvy-api" }));

app.use("/api/v1", router);

app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`🛋  LVY API ready on http://localhost:${port}`);
});
