import { Router } from "express";

import { createCategoryController } from "@src/controllers/category/create.controller";
import { updateCategoryController } from "@src/controllers/category/edit.controller";
import { upload } from "@src/middlewares/multer.middleware";
import { getCategoriesController } from "@src/controllers/category/getAll.controller";
import { getCategoryByIdController } from "@src/controllers/category/getById.controller";
import { getCategoriesSelectController } from "@src/controllers/category/select.controller";

const categoryRouter = Router();

categoryRouter.post(
  "/create",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createCategoryController
);

categoryRouter.get("/", getCategoriesController);
categoryRouter.get("/select", getCategoriesSelectController);
categoryRouter.post(
  "/update",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateCategoryController
);

categoryRouter.get("/:id", getCategoryByIdController);
export { categoryRouter };
