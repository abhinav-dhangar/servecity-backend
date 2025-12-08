import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const getOrdersOfVendorController = async (req: Request, res: Response) => {
  try {
    const vendorId = req.user.id;

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = (req.query.status as string) || "";
    const offset = (page - 1) * limit;

    // ==============================================
    // STEP 1: Fetch orders for vendor
    // ==============================================
    let orderQuery = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("vendorId", vendorId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      orderQuery = orderQuery.eq("orderStatus", status);
    }

    const { data: orders, error: ordersError, count } = await orderQuery;

    if (ordersError) {
      return res.status(500).json({
        message: "Error fetching orders",
        error: ordersError,
      });
    }

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: "No orders found",
        orders: [],
      });
    }

    // Extract order IDs
    const orderIds = orders.map((o: any) => o.id);

    // ==============================================
    // STEP 2: Fetch order_items for these orders
    // ==============================================
    const { data: orderItems, error: itemsError } = await supabase
      .from("orderItems")
      .select("*")
      .in("orderId", orderIds);

    if (itemsError) {
      return res.status(500).json({
        message: "Error fetching order items",
        error: itemsError,
      });
    }

    // ==============================================
    // STEP 3: Merge items into orders
    // ==============================================
    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      items: orderItems.filter((item: any) => item.orderId === order.id),
    }));

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders: ordersWithItems,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get Orders Of Vendor Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
