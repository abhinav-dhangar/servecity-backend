import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const getOrderDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    // --------------------------------------------------
    // 1️⃣ Fetch the order (restrict to logged-in user)
    // --------------------------------------------------
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        `
    id,
    created_at,
    totalAmount,
    paymentMethod,
    orderStatus,
    addressId,
    userId,

    items:orderItems (
      id,
      serviceId,
      price,
      status,
      date,
      timeSlot,
      workerId,

      services (
        id,
        title,
        image,
        description,
        totalDuration,
        subCategoryId
      ),

      workers (
        id,
        fullName,
        avatar,
        phone
      )
    ),

    addresses (
      id,
      fullName,
      phone,
      city,
      state,
      roadStreet,
      pinCode,
      landmark
    )
  `
      )
      .eq("id", orderId)
      .eq("userId", userId)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({
        message: "Order not found",
        error: orderErr,
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get Order Details Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
