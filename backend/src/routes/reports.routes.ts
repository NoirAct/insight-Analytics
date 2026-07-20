import { Router } from "express";
import { reportsController } from "../controllers/reports.controller.js";
import { requireAuth } from "../middlewares/auth.js";

export const reportsRouter = Router();

reportsRouter.use(requireAuth);
reportsRouter.get("/orders", reportsController.list);
reportsRouter.get("/orders/export.csv", reportsController.exportCsv);
reportsRouter.get("/orders/export.pdf", reportsController.exportPdf);
