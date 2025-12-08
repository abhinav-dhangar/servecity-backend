// src/controllers/cart/updateCartQuantity.controller.ts

import { Request, Response } from "express";
import {
  getOrCreateCartIdForUser,
  getCartFromRedis,
  saveCartToRedis,
} from "@src/services/cart/cart.helper";

export const updateCartQuantityController = async (req: Request, res: Response) => {
  try {
    const { cartItemId, quantity } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const cartId = await getOrCreateCartIdForUser(userId);

    const cart = await getCartFromRedis(cartId);

    const index = cart.findIndex((c) => c.id === cartItemId);
    if (index === -1) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity <= 0) {
      cart.splice(index, 1); // remove item
    } else {
      cart[index].quantity = quantity;
    }

    await saveCartToRedis(cartId, cart);

    return res.status(200).json({ message: "Quantity updated", cart });
  } catch (error) {
    return res.status(500).json({ message: "Internal error", error });
  }
};
