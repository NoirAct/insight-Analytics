import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export function demoReadOnly(req: Request, res: Response, next: NextFunction) {
  if (env.DEMO_MODE && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return res.status(403).json({
      error: "A demonstração é somente leitura. Esta alteração foi bloqueada.",
      code: "DEMO_READ_ONLY",
    });
  }
  return next();
}

export function demoAccountCreationGuard(req: Request, res: Response, next: NextFunction) {
  if (env.DEMO_MODE) {
    return res.status(403).json({
      error: "Cadastro e recuperação de senha estão desabilitados na demonstração.",
      code: "DEMO_AUTH_DISABLED",
    });
  }
  return next();
}
