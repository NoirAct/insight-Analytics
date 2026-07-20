import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middlewares/error-handler.js";
import { productsService } from "../services/products.service.js";
import {
  createCategorySchema,
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
} from "../validators/products.validators.js";

export const productsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listProductsSchema.parse(req.query);
      const result = await productsService.list(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.getById(String(req.params.id));
      res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createProductSchema.parse(req.body);
      const product = await productsService.create(input);
      res.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateProductSchema.parse(req.body);
      const product = await productsService.update(String(req.params.id), input);
      res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productsService.remove(String(req.params.id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "Arquivo de imagem obrigatório");
      }
      const imageUrl = `/uploads/products/${req.file.filename}`;
      const product = await productsService.updateImage(
        String(req.params.id),
        imageUrl,
      );
      res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productsService.listCategories();
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createCategorySchema.parse(req.body);
      const category = await productsService.createCategory(input);
      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  },
};
