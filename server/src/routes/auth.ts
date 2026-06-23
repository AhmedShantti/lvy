import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt.js";
import { HttpError } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { sendVerificationEmail } from "../lib/email.js";

export const authRouter = Router();

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function clientUrl() {
  // First configured origin, trailing slashes stripped (avoids "…app//verify-email").
  return (process.env.CLIENT_URL?.split(",")[0]?.trim().replace(/\/+$/, "")) || "http://localhost:5173";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function newVerifyToken() {
  return { verifyToken: randomBytes(32).toString("hex"), verifyTokenExp: new Date(Date.now() + VERIFY_TTL_MS) };
}

async function dispatchVerification(email: string, name: string, token: string) {
  const link = `${clientUrl()}/verify-email?token=${token}`;
  try {
    await sendVerificationEmail(email, name, link);
  } catch (e) {
    // Don't fail the request if the mail provider hiccups — the user can resend.
    console.error("[auth] verification email failed:", e);
  }
  // Always log the link so verification is possible in dev / when email is unconfigured.
  console.log(`[auth] verification link for ${email}: ${link}`);
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const email = normalizeEmail(parsed.email);
    const { password, name } = parsed;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new HttpError(409, "Email already registered");
    const passwordHash = await bcrypt.hash(password, 10);
    const { verifyToken, verifyTokenExp } = newVerifyToken();
    const user = await prisma.user.create({
      data: { email, passwordHash, name, verifyToken, verifyTokenExp },
    });
    await dispatchVerification(user.email, user.name, verifyToken);
    // No tokens issued — the account must verify its email before signing in.
    res.status(201).json({ verificationRequired: true, email: user.email });
  } catch (e) { next(e); }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const email = normalizeEmail(body.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before signing in — check your inbox for the verification link.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }
    const payload = { sub: user.id, role: user.role };
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: signAccess(payload),
      refreshToken: signRefresh(payload),
    });
  } catch (e) { next(e); }
});

authRouter.post("/verify-email", async (req, res, next) => {
  try {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { verifyToken: token } });
    if (!user || !user.verifyTokenExp || user.verifyTokenExp < new Date()) {
      throw new HttpError(400, "This verification link is invalid or has expired. Please request a new one.");
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
    });
    const payload = { sub: updated.id, role: updated.role };
    // Verifying also signs the user in.
    res.json({
      user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
      accessToken: signAccess(payload),
      refreshToken: signRefresh(payload),
    });
  } catch (e) { next(e); }
});

authRouter.post("/resend-verification", async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const email = normalizeEmail(body.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.emailVerified) {
      const { verifyToken, verifyTokenExp } = newVerifyToken();
      await prisma.user.update({ where: { id: user.id }, data: { verifyToken, verifyTokenExp } });
      await dispatchVerification(user.email, user.name, verifyToken);
    }
    // Generic response — never reveal whether an email exists or is already verified.
    res.json({ ok: true });
  } catch (e) { next(e); }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const decoded = verifyRefresh(refreshToken);
    const payload = { sub: decoded.sub, role: decoded.role };
    res.json({ accessToken: signAccess(payload), refreshToken: signRefresh(payload) });
  } catch { next(new HttpError(401, "Invalid refresh token")); }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, name: true, role: true, phone: true, addresses: true },
    });
    res.json({ user });
  } catch (e) { next(e); }
});
