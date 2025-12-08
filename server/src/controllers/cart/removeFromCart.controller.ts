// src/controllers/cart/removeServiceFromCart.controller.ts

import { Request, Response } from "express";
import {
  getCartFromRedis,
  saveCartToRedis,
  getOrCreateCartIdForUser,
} from "@src/services/cart/cart.helper";

export const removeServiceFromCartController = async (req: Request, res: Response) => {
  try {
    const { cartItemId } = req.body;

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cartId = await getOrCreateCartIdForUser(userId);
    const cart = await getCartFromRedis(cartId);

    const newCart = cart.filter((c) => c.id !== cartItemId);

    await saveCartToRedis(cartId, newCart);

    return res.status(200).json({ message: "Item removed", cart: newCart });
  } catch (error) {
    return res.status(500).json({ message: "Internal error", error });
  }
};
