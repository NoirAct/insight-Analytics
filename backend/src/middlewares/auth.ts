import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error-handler.js";
import { verifyAccessToken } from "../utils/crypto.js";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthUser;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new AppError(401, "Não autenticado"));
  }

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch {
    return next(new AppError(401, "Token inválido ou expirado"));
  }
}
