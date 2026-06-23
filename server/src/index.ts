import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { parse as parseYaml } from "yaml";
import { readFileSync } from "fs";
import { resolve } from "path";
import { errorHandler } from "./middleware/error.js";
import { router } from "./routes/index.js";

const app = express();

// Behind Render's proxy — trust the first hop so rate limiting keys on the real client IP.
app.set("trust proxy", 1);

// ── API docs (Swagger UI) ──
// Loaded from server/openapi.yaml and mounted BEFORE helmet so its CSP doesn't
// block the Swagger UI assets/inline bootstrap script.
try {
  const spec = parseYaml(readFileSync(resolve(process.cwd(), "openapi.yaml"), "utf8"));
  app.get("/openapi.yaml", (_req, res) => {
    res.type("text/yaml").send(readFileSync(resolve(process.cwd(), "openapi.yaml"), "utf8"));
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: "LVY API Docs" }));
  console.log("📚 API docs at /docs");
} catch (e) {
  console.warn("[docs] openapi.yaml not loaded:", (e as Error).message);
}

app.use(helmet());
app.use(cors({
  origin: [
    "https://lvy-gamma.vercel.app",
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(morgan("dev"));

// Stripe webhooks need raw body — mount BEFORE json parser
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

app.use(rateLimit({ windowMs: 60_000, max: 200 }));

// Stricter limiter on auth endpoints to slow brute-force / spraying.
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts — please try again in a few minutes." },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/resend-verification", authLimiter);

app.get("/health", (_req, res) => res.json({ ok: true, service: "lvy-api" }));

app.use("/api/v1", router);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});