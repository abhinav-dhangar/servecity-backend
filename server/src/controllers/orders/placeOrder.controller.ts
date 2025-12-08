// controllers/orders/checkoutCart.controller.ts

import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";
import {
  getCartFromRedis,
  saveCartToRedis,
} from "@src/services/cart/cart.helper";
import { z } from "zod";

// ===============================
// ZOD VALIDATION
// ===============================
const checkoutSchema = z.object({
  body: z.object({
    addressId: z.number(),
    paymentMethod: z.enum(["cod", "online"]),
  }),
});

export const checkoutCartController = async (req: Request, res: Response) => {
  try {
    // ===============================
    // Step A – Zod validation
    // ===============================
    const parsed = checkoutSchema.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request",
        errors: parsed.error.flatten(),
      });
    }

    const { addressId, paymentMethod } = parsed.data.body;
    const userId = req.user.id;

    // ===============================
    // Step B – Get user's cartId
    // ===============================
    const { data: profile } = await supabase
      .from("profiles")
      .select("cartId")
      .eq("userId", userId)
      .single();

    if (!profile?.cartId) {
      return res.status(400).json({ message: "Missing cartId" });
    }

    const cartId = profile.cartId;

    // ===============================
    // Step C – Load cart from Redis
    // ===============================
    const cart = await getCartFromRedis(cartId);

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ===============================
    // Step D – Validate Address
    // ===============================
    const { data: address } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("userId", userId)
      .maybeSingle();

    if (!address) {
      return res.status(404).json({ message: "Invalid addressId" });
    }

    // ===============================
    // Step E – Calculate Total Amount
    // ===============================
    const totalAmount = cart.reduce(
      (sum, item) => sum + item.servicePrice * item.quantity,
      0
    );

    // ===============================
    // Step F – Create ORDER
    // ===============================
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert([
        {
          userId,
          addressId,
          totalAmount,
          paymentMethod,
          // paymentStatus: "pending",
        },
      ])
      .select()
      .single();

    if (orderErr) {
      return res.status(500).json({
        message: "Failed to create order",
        error: orderErr,
      });
    }

    // ===============================
    // Step G – Create ORDER ITEMS
    // (Expand quantity → multiple tasks)
    // ===============================
    const orderItemsPayload = [];

    for (const item of cart) {
      for (let i = 0; i < item.quantity; i++) {
        orderItemsPayload.push({
          orderId: order.id,
          serviceId: item.serviceId,
          price: item.servicePrice,
          date: item.date,
          timeSlot: item.timeSlot,
          workerId: null,
          status: "unassigned",
        });
      }
    }

    const { error: orderItemsErr } = await supabase
      .from("orderItems")
      .insert(orderItemsPayload);

    if (orderItemsErr) {
      return res.status(500).json({
        message: "Failed to create order items",
        error: orderItemsErr,
      });
    }

    // ===============================
    // Step H – Clear Cart
    // ===============================
    await saveCartToRedis(cartId, []); // empty array

    // ===============================
    // Step I – Respond
    // ===============================
    return res.status(201).json({
      message: "Checkout successful",
      orderId: order.id,
      totalAmount,
      tasksCreated: orderItemsPayload.length,
    });
  } catch (error) {
    console.error("Checkout Cart Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
