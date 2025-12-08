import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";

export const createAddressController = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { street, city, state, pinCode, phone, fullName } = req.body;

    // ==============================================
    // STEP 0: Check if address already exists
    // ==============================================
    const { count, error: addressCheckError } = await supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("userId", userId);
    if (addressCheckError) {
      return res.status(500).json({
        message: "Error checking address record",
        error: addressCheckError,
      });
    }

    if (count > 3) {
      return res.status(400).json({
        message: "Maximum Address already exists for this user",
      });
    }

    // ==============================================

    // STEP 1: Create Address Record
    // ==============================================
    const { data: newAddress, error: addressCreateError } = await supabase
      .from("addresses")
      .insert({
        userId,
        roadStreet: street,
        city,
        state,
        pinCode,
        fullName,
        phone,
      })
      .select()
      .maybeSingle();

    if (addressCreateError) {
      return res.status(500).json({
        message: "Error creating address record",
        error: addressCreateError,
      });
    }
    return res.status(201).json({
      message: "Address created successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error,
    });
  }
};
