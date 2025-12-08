import { buyNowController } from "@src/controllers/orders/buyNow.controller";
import { cancelOrderController } from "@src/controllers/orders/cancelOrder.controller";
import { getOrderDetailsController } from "@src/controllers/orders/orderDetails.controller";
import { checkoutCartController } from "@src/controllers/orders/placeOrder.controller";
import { getOrdersController } from "@src/controllers/orders/userOrder.controller";
import { getOrdersOfVendorController } from "@src/controllers/orders/vendorOrder.controller";
import { isAuthenticated } from "@src/middlewares/isAuth.middleware";
import { isVendor } from "@src/middlewares/isVendor.middleware";
import { Router } from "express";

const orderRouter = Router();

orderRouter.post("/place-order", isAuthenticated, checkoutCartController);
orderRouter.get("/list", isAuthenticated, getOrdersController);
orderRouter.post("/buy-now", isAuthenticated, buyNowController);
orderRouter.post("/vendor-orders", isVendor, getOrdersOfVendorController);
orderRouter.post("/cancel", isAuthenticated, cancelOrderController);
orderRouter.get("/order/:orderId", isAuthenticated, getOrderDetailsController);
export { orderRouter };
