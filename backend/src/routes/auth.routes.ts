import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { demoAccountCreationGuard } from "../middlewares/demo-mode.js";

export const authRouter = Router();

authRouter.post("/register", demoAccountCreationGuard, authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.me);
authRouter.post("/forgot-password", demoAccountCreationGuard, authController.forgotPassword);
authRouter.post("/reset-password", demoAccountCreationGuard, authController.resetPassword);
