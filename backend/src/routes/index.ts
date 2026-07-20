import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { healthRouter } from "./health.routes.js";
import { productsRouter } from "./products.routes.js";
import { profileRouter } from "./profile.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { usersRouter } from "./users.routes.js";

export const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/dashboard", dashboardRouter);
routes.use("/users", usersRouter);
routes.use("/products", productsRouter);
routes.use("/reports", reportsRouter);
routes.use("/profile", profileRouter);
