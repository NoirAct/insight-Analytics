import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middlewares/error-handler.js";
import { authService } from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../middlewares/auth.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.validators.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input, req, res);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input, req, res);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refresh(req, res);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.logout(req, res);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        throw new AppError(401, "Não autenticado");
      }
      const result = await authService.me(authReq.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
