import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt.js";
import { HttpError } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email.js";

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
  // Log the link only outside production so verification is possible in dev /
  // when email is unconfigured — never write tokens to production logs.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[auth] verification link for ${email}: ${link}`);
  }
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
    const ok = await bcrypt.compare(body.password, user.passwordHash);
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
      select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true, addresses: true },
    });
    res.json({ user });
  } catch (e) { next(e); }
});

// ═════ Profile update (name / phone) ═════
authRouter.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().max(40).optional(),
    }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data,
      select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
    });
    res.json({ user });
  } catch (e) { next(e); }
});

// ═════ Change password (authenticated) ═════
authRouter.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw new HttpError(404, "User not found");
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new HttpError(400, "Current password is incorrect");
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ═════ Forgot password (request a reset link) ═════
authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const email = normalizeEmail(body.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetToken = randomBytes(32).toString("hex");
      const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExp } });
      const link = `${clientUrl()}/reset-password?token=${resetToken}`;
      try {
        await sendPasswordResetEmail(user.email, user.name, link);
      } catch (e) {
        console.error("[auth] reset email failed:", e);
      }
      if (process.env.NODE_ENV !== "production") {
        console.log(`[auth] password reset link for ${email}: ${link}`);
      }
    }
    // Generic response — never reveal whether the email exists.
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ═════ Reset password (consume the token) ═════
authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = z.object({
      token: z.string().min(1),
      password: z.string().min(8),
    }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      throw new HttpError(400, "This reset link is invalid or has expired. Please request a new one.");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      // Resetting the password also confirms control of the inbox → mark verified.
      data: { passwordHash, resetToken: null, resetTokenExp: null, emailVerified: true },
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
