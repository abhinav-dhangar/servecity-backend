// src/controllers/cart/clearCart.controller.ts

import { Request, Response } from "express";
import { saveCartToRedis, getOrCreateCartIdForUser } from "@src/services/cart/cart.helper";

export const clearCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cartId = await getOrCreateCartIdForUser(userId);
    await saveCartToRedis(cartId, []);

    return res.status(200).json({ message: "Cart cleared", cart: [] });
  } catch (error) {
    return res.status(500).json({ message: "Internal error", error });
  }
};
