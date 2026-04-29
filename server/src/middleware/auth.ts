import type { Request, Response, NextFunction } from "express";
import { verifyAccess, type JwtPayload } from "../lib/jwt.js";
import { HttpError } from "./error.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Unauthorized");
  try {
    req.user = verifyAccess(header.slice(7));
    next();
  } catch {
    throw new HttpError(401, "Invalid token");
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") throw new HttpError(403, "Forbidden");
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = verifyAccess(header.slice(7));
    } catch {
      // ignore — treat as anonymous
    }
  }
  next();
}
