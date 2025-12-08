import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const getAllAddressesOfSameUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id;

    // Optional pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // ==============================================
    // STEP 1: Fetch all addresses for this user
    // ==============================================
    const {
      data: addresses,
      count,
      error,
    } = await supabase
      .from("addresses")
      .select("*", { count: "exact" })
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        message: "Error fetching addresses",
        error,
      });
    }

    return res.status(200).json({
      message: "Addresses fetched successfully",
      addresses,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
