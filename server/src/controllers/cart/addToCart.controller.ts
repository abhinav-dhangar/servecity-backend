// src/controllers/cart/addServiceToCart.controller.ts

import { Request, Response } from "express";
import {
  getOrCreateCartIdForUser,
  getCartFromRedis,
  saveCartToRedis,
} from "@src/services/cart/cart.helper";

import { supabase } from "@utils/supa.conn";
import { addServiceToCartSchema, ServiceCartItem } from "@src/schema/cart.zod";

// -------------------------------
// ADD SERVICE TO CART
// -------------------------------
export const addServiceToCartController = async (
  req: Request,
  res: Response
) => {
  try {
    // 1️⃣ Validate input
    const parsed = addServiceToCartSchema.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid cart item",
        errors: parsed.error.flatten(),
      });
    }

    const item: ServiceCartItem = parsed.data.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    // 2️⃣ Get or create cartId
    const cartId = await getOrCreateCartIdForUser(userId);

    // 3️⃣ Load cart
    const cart = await getCartFromRedis(cartId);

    console.log("new cart new cart : ",cart)
    // 4️⃣ Fetch service data for metadata
    const { data: serviceData } = await supabase
      .from("services")
      .select("title, image, price, totalDuration, description")
      .eq("id", item.serviceId)
      .single();

    if (!serviceData) {
      return res.status(404).json({ message: "Service not found" });
    }

    item.serviceName = serviceData.title;
    item.image = serviceData.image;
    item.servicePrice = serviceData.price;
    item.totalDuration = serviceData.totalDuration;

    // ----------------------------------------------------
    // 🔥 5️⃣ UC-style uniqueness rule:
    // Same service + same date + same timeSlot → merge
    // ----------------------------------------------------
    const existingIndex = cart.findIndex(
      (c) =>
        c.serviceId === item.serviceId
      //  &&
        // c.date === item.date &&
        // c.timeSlot === item.timeSlot
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      console.log("cart is ",cart)
      cart.push(item);
      console.log("item is ",item)
    }

    // 6️⃣ Save cart
    await saveCartToRedis(cartId, cart);

    return res.status(200).json({
      message: "Service added to cart",
      cartId,
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
