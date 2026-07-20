import type { NextFunction, Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { dashboardPeriodSchema } from "../validators/dashboard.validators.js";

export const dashboardController = {
  async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const input = dashboardPeriodSchema.parse(req.query);
      const data = await dashboardService.getOverview(input);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async charts(req: Request, res: Response, next: NextFunction) {
    try {
      const input = dashboardPeriodSchema.parse(req.query);
      const data = await dashboardService.getCharts(input);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
