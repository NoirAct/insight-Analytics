import { Router } from "express";
import { usersController } from "../controllers/users.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { avatarUpload } from "../middlewares/upload.js";
import { demoReadOnly } from "../middlewares/demo-mode.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.use(demoReadOnly);

usersRouter.get("/roles", usersController.listRoles);
usersRouter.get("/", usersController.list);
usersRouter.get("/:id", usersController.getById);
usersRouter.post("/", usersController.create);
usersRouter.patch("/:id", usersController.update);
usersRouter.delete("/:id", usersController.remove);
usersRouter.post(
  "/:id/avatar",
  avatarUpload.single("avatar"),
  usersController.uploadAvatar,
);
