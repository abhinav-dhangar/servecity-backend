import { Request, Response } from "express";

import { cartArraySchema } from "@src/schema/cart.zod";
import {
  getCartFromRedis,
  getOrCreateCartIdForUser,
  saveCartToRedis,
} from "@src/services/cart/cart.helper";

export const mergeCartController = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Validate guest cart
    const parsed = cartArraySchema.safeParse(req.body.guestCart || []);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid guest cart",
        errors: parsed.error.flatten(),
      });
    }

    const guestCart = parsed.data;

    // Fetch server cart
    const cartId = await getOrCreateCartIdForUser(userId);
    const serverCart = await getCartFromRedis(cartId);

    // MERGE LOGIC
    const merged = [...serverCart];

    for (const guestItem of guestCart) {
      const index = merged.findIndex(
        (item) =>
          item.productId === guestItem.productId &&
          (item.variant || "") === (guestItem.variant || "")
      );

      if (index !== -1) {
        merged[index].quantity += guestItem.quantity; // merge
      } else {
        merged.push(guestItem);
      }
    }

    // SAVE MERGED CART
    await saveCartToRedis(cartId, merged);

    return res.status(200).json({
      message: "Cart merged successfully",
      cart: merged,
    });
  } catch (error) {
    console.error("Merge cart error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
