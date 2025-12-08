// controllers/cart/getCartItems.controller.ts

import { Request, Response } from "express";
import { redisClient } from "@utils/redis.conn";
import { supabase } from "@utils/supa.conn";

export const getCartItemsController = async (req: Request, res: Response) => {
  try {
    // 1. Get user's cartId from profile
    const { data } = await supabase
      .from("profiles")
      .select("cartId")
      .eq("userId", req.user.id)
      .limit(1);

    const cartId = data?.[0]?.cartId;
    if (!cartId) {
      return res.status(400).json({ message: "cartId is required" });
    }

    // 2. Get raw Redis string
    let raw = await redisClient.get(cartId);
    console.log(raw);
    console.log(Object.keys(raw));

    // 👉 FINAL RESPONSE — return RAW STRING directly
    return res.status(200).json({
      message: "Cart fetched successfully",
      cartId,
      raw,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
