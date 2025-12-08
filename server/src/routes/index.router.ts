import express from "express";
import { helloworldRouter } from "./helloworld.route";
import { authRouter } from "./auth.route";
import { categoryRouter } from "./category.route";
import { subCategoryRouter } from "./subCategory.route";
import { serviceRouter } from "./service.route";
import { addressRouter } from "./address.route";
import { cartRouter } from "./cart.route";
import { workerRouter } from "./worker.route";
import { orderRouter } from "./order.route";

const router = express.Router();

router.use("/", helloworldRouter);
router.use("/addresses", addressRouter);
router.use("/auth", authRouter);
router.use("/carts", cartRouter);
router.use("/workers", workerRouter);
router.use("/categories", categoryRouter);
router.use("/subcategories", subCategoryRouter);
router.use("/services", serviceRouter);
router.use("/orders", orderRouter);
export { router };
