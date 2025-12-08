import { addServiceToCartController } from "@src/controllers/cart/addToCart.controller";
import { clearCartController } from "@src/controllers/cart/clearCart.controller";
import { getCartItemsController } from "@src/controllers/cart/getCartItems.controller";
import { mergeCartController } from "@src/controllers/cart/mergeCart.controller";
import { removeServiceFromCartController } from "@src/controllers/cart/removeFromCart.controller";
import { isAuthenticated } from "@src/middlewares/isAuth.middleware";
import { addServiceToCartSchema } from "@src/schema/cart.zod";
import { validate } from "@utils/validate.zod";
import { Router } from "express";

const cartRouter = Router();

cartRouter.post(
  "/add",
  validate(addServiceToCartSchema),
  isAuthenticated,
  addServiceToCartController
);
cartRouter.post("/remove", isAuthenticated, removeServiceFromCartController);
cartRouter.post(
  "/clear",
  isAuthenticated,
  clearCartController,
  clearCartController
);
cartRouter.post("/merge", isAuthenticated, mergeCartController);
cartRouter.get("/", isAuthenticated, getCartItemsController);

export { cartRouter };
