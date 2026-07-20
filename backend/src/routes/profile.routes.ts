import { Router } from "express";
import { profileController } from "../controllers/profile.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { avatarUpload, companyLogoUpload } from "../middlewares/upload.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.patch("/me", profileController.updateMe);
profileRouter.post("/me/avatar", avatarUpload.single("avatar"), profileController.uploadAvatar);
profileRouter.get("/sessions", profileController.listSessions);
profileRouter.delete("/sessions/:id", profileController.revokeSession);
profileRouter.get("/notifications", profileController.listNotifications);
profileRouter.patch(
  "/notifications/:id/read",
  profileController.markNotificationRead,
);
profileRouter.get("/company", profileController.getCompany);
profileRouter.patch("/company", profileController.updateCompany);
profileRouter.post(
  "/company/logo",
  companyLogoUpload.single("logo"),
  profileController.uploadCompanyLogo,
);
