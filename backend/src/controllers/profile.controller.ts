import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error-handler.js";
import { profileService } from "../services/profile.service.js";
import {
  updateCompanySchema,
  updateProfileSchema,
} from "../validators/profile.validators.js";

export const profileController = {
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const input = updateProfileSchema.parse(req.body);
      const user = await profileService.updateProfile(authReq.user.id, input);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!req.file) throw new AppError(400, "Arquivo de imagem obrigatório");
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const user = await profileService.updateAvatar(authReq.user.id, avatarUrl);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const sessions = await profileService.listSessions(authReq.user.id);
      res.json({ sessions });
    } catch (error) {
      next(error);
    }
  },

  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await profileService.revokeSession(
        authReq.user.id,
        String(req.params.id),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const notifications = await profileService.listNotifications(authReq.user.id);
      res.json({ notifications });
    } catch (error) {
      next(error);
    }
  },

  async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const notification = await profileService.markNotificationRead(
        authReq.user.id,
        String(req.params.id),
      );
      res.json({ notification });
    } catch (error) {
      next(error);
    }
  },

  async getCompany(_req: Request, res: Response, next: NextFunction) {
    try {
      const company = await profileService.getCompany();
      res.json({ company });
    } catch (error) {
      next(error);
    }
  },

  async updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateCompanySchema.parse(req.body);
      const company = await profileService.updateCompany(input);
      res.json({ company });
    } catch (error) {
      next(error);
    }
  },

  async uploadCompanyLogo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError(400, "Arquivo de imagem obrigatório");
      const logoUrl = `/uploads/company/${req.file.filename}`;
      const company = await profileService.updateCompanyLogo(logoUrl);
      res.json({ company });
    } catch (error) {
      next(error);
    }
  },
};
