import { Router } from "express";

import { getSubCategoriesController } from "@src/controllers/subcategory/getAll.controller";
import { upload } from "@src/middlewares/multer.middleware";
import { createSubCategoryController } from "@src/controllers/subcategory/create.controller";
import { updateSubCategoryController } from "@src/controllers/subcategory/edit.controller";
import { deleteSubCategoryController } from "@src/controllers/subcategory/delete.controller";
import { getSubCategoriesSelectController } from "@src/controllers/subcategory/select.controller";

const subCategoryRouter = Router();

subCategoryRouter.get("/", getSubCategoriesController);
subCategoryRouter.get("/select", getSubCategoriesSelectController);

subCategoryRouter.post(
  "/create",
  upload.single("image"),
  createSubCategoryController
);

subCategoryRouter.post(
  "/update",
  upload.single("image"),
  updateSubCategoryController
);

subCategoryRouter.post("/delete", deleteSubCategoryController);

export { subCategoryRouter };
