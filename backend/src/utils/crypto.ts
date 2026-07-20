import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createRawToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
};

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: { sub: string; sid: string }, rememberMe: boolean) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: (rememberMe
      ? env.JWT_REFRESH_REMEMBER_EXPIRES_IN
      : env.JWT_REFRESH_EXPIRES_IN) as jwt.SignOptions["expiresIn"],
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as {
    sub: string;
    sid: string;
  };
}

export function refreshExpiryDate(rememberMe: boolean) {
  const days = rememberMe ? 30 : 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function passwordResetExpiryDate() {
  return new Date(Date.now() + 60 * 60 * 1000);
}
