import type { NextFunction, Request, Response } from "express";
import { reportsService } from "../services/reports.service.js";
import { listReportsSchema } from "../validators/reports.validators.js";

export const reportsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listReportsSchema.parse(req.query);
      const result = await reportsService.listOrders(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listReportsSchema.parse(req.query);
      const rows = await reportsService.listAllForExport(input);
      const csv = reportsService.toCsv(rows);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="relatorio-pedidos.csv"`,
      );
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  async exportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listReportsSchema.parse(req.query);
      const rows = await reportsService.listAllForExport(input);
      const pdf = await reportsService.toPdfBuffer(rows);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="relatorio-pedidos.pdf"`,
      );
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  },
};
