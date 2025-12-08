// routes/serviceRoutes.js

import {
  getAllServicesController,
  getRandomServicesController,
  getServicesByCategory,
} from "@src/controllers/services/getAll.controller";
import express from "express";

const serviceRouter = express.Router();

// GET all services grouped by subcategory (UC style)
serviceRouter.get("/category/:categoryId", getServicesByCategory);
serviceRouter.get("/", getAllServicesController);
serviceRouter.get("/random", getRandomServicesController);
export { serviceRouter };
