import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const getOrdersController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ----------------------------------
    //  PAGINATION
    // ----------------------------------
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // ----------------------------------
    //  FETCH ORDERS WITH SERVICE DETAILS
    // ----------------------------------
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        totalAmount,
        addressId,
        userId,
        paymentMethod,
        orderStatus,

        items:orderItems (
          id,
          serviceId,
          orderId,
          quantity,
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
            categoryId,
            subCategoryId
          )
        )
      `
      )
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        message: "Failed to fetch orders",
        error,
      });
    }

    // ----------------------------------
    //  COUNT TOTAL FOR PAGINATION
    // ----------------------------------
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders: orders || [],
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
