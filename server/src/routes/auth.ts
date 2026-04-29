import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt.js";
import { HttpError } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new HttpError(409, "Email already registered");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });
    const payload = { sub: user.id, role: user.role };
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: signAccess(payload),
      refreshToken: signRefresh(payload),
    });
  } catch (e) { next(e); }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");
    const payload = { sub: user.id, role: user.role };
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: signAccess(payload),
      refreshToken: signRefresh(payload),
    });
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
