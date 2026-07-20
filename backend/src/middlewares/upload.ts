import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { AppError } from "./error-handler.js";

function createImageUpload(subdir: string) {
  const uploadsRoot = path.resolve(process.cwd(), "uploads", subdir);
  fs.mkdirSync(uploadsRoot, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsRoot);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".png";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        cb(new AppError(400, "Envie apenas imagens"));
        return;
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  });
}

export const avatarUpload = createImageUpload("avatars");
export const productImageUpload = createImageUpload("products");
export const companyLogoUpload = createImageUpload("company");
