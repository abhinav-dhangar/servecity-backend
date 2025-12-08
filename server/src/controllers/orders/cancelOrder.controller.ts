import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const cancelOrderController = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    // ==============================================
    // STEP 0: Fetch order – ensure user owns it
    // ==============================================
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("userId", userId)
      .maybeSingle();

    if (orderErr) {
      return res.status(500).json({
        message: "Error fetching order",
        error: orderErr,
      });
    }

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you do not have permission to cancel it",
      });
    }

    // ==============================================
    // STEP 1: Ensure order is cancellable
    // ==============================================
    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "You cannot cancel this order because it is already processed",
      });
    }

    // ==============================================
    // STEP 2: Get all order items
    // ==============================================
    const { data: orderItems, error: itemsErr } = await supabase
      .from("orderItems")
      .select("*")
      .eq("orderId", orderId);

    if (itemsErr) {
      return res.status(500).json({
        message: "Error fetching order items",
        error: itemsErr,
      });
    }

    // ==============================================
    // STEP 3: RESTOCK products based on variants
    // ==============================================
    for (const item of orderItems) {
      const { productId, quantity, variant } = item;

      // Get product
      const { data: product, error: productErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (productErr || !product) continue;

      // Rebuild updated variants
      const updatedVariants = product.variant.map((v: any) => {
        if (v.type !== variant.type) return v;

        return {
          ...v,
          options: v.options.map((opt: any) => {
            if (opt.value !== variant.value) return opt;
            return {
              ...opt,
              stock: opt.stock + quantity, // RESTOCK ✨
            };
          }),
        };
      });

      // Update product stock
      await supabase
        .from("products")
        .update({ variant: updatedVariants })
        .eq("id", product.id);
    }

    // ==============================================
    // STEP 4: Update order status → cancelled
    // ==============================================
    const { error: updateErr } = await supabase
      .from("orders")
      .update({ orderStatus: "cancelled", paymentStatus: "refunded" })
      .eq("id", orderId)
      .eq("userId", userId);

    if (updateErr) {
      return res.status(500).json({
        message: "Failed to cancel the order",
        error: updateErr,
      });
    }

    return res.status(200).json({
      message: "Order cancelled and stock restored successfully",
      orderId,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
