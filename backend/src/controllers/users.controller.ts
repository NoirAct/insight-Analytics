import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error-handler.js";
import { usersService } from "../services/users.service.js";
import {
  createUserSchema,
  listUsersSchema,
  updateUserSchema,
} from "../validators/users.validators.js";

export const usersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listUsersSchema.parse(req.query);
      const result = await usersService.list(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getById(String(req.params.id));
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createUserSchema.parse(req.body);
      const user = await usersService.create(input);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateUserSchema.parse(req.body);
      const user = await usersService.update(String(req.params.id), input);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await usersService.remove(String(req.params.id), authReq.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "Arquivo de imagem obrigatório");
      }
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const user = await usersService.updateAvatar(String(req.params.id), avatarUrl);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async listRoles(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await usersService.listRoles();
      res.json({ roles });
    } catch (error) {
      next(error);
    }
  },
};
