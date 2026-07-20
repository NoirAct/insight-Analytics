import { Router } from "express";
import { productsController } from "../controllers/products.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { productImageUpload } from "../middlewares/upload.js";

export const productsRouter = Router();

productsRouter.use(requireAuth);

productsRouter.get("/categories", productsController.listCategories);
productsRouter.post("/categories", productsController.createCategory);
productsRouter.get("/", productsController.list);
productsRouter.get("/:id", productsController.getById);
productsRouter.post("/", productsController.create);
productsRouter.patch("/:id", productsController.update);
productsRouter.delete("/:id", productsController.remove);
productsRouter.post(
  "/:id/image",
  productImageUpload.single("image"),
  productsController.uploadImage,
);
