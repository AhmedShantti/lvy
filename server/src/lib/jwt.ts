import jwt from "jsonwebtoken";
import { SignOptions } from 'jsonwebtoken';

const ACCESS = process.env.JWT_SECRET ?? "dev-access";
const REFRESH = process.env.JWT_REFRESH_SECRET ?? "dev-refresh";

export interface JwtPayload {
  sub: string;
  role: "CUSTOMER" | "ADMIN";
}

export function signAccess(p: JwtPayload) {
  return jwt.sign(p, ACCESS, { expiresIn: (process.env.JWT_EXPIRES_IN ?? "15m") as SignOptions['expiresIn'] });
}
export function signRefresh(p: JwtPayload) {
  return jwt.sign(p, REFRESH, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as SignOptions['expiresIn'] });
}
export function verifyAccess(token: string) {
  return jwt.verify(token, ACCESS) as JwtPayload;
}
export function verifyRefresh(token: string) {
  return jwt.verify(token, REFRESH) as JwtPayload;
}