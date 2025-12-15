import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";

export const editAddressController = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { addressId, ...incomingFields } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: "addressId is required" });
    }

    // ==============================================
    // STEP 0: Check Address Ownership
    // ==============================================
    const { data: existingAddress, error: findError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("userId", userId)
      .maybeSingle();

    if (findError) {
      return res.status(500).json({
        message: "Error fetching address",
        error: findError,
      });
    }

    if (!existingAddress) {
      return res.status(404).json({
        message: "Address not found for this user",
      });
    }

    // ==============================================
    // STEP 1: Build update object dynamically
    // Only include fields that are NOT undefined
    // ==============================================
    const allowedFields = [
      "street",
      "city",
      "state",
      "pinCode",
      "phone",
      "landmark",
      "fullName",
      "roadStreet",
    ];

    const updateObj: Record<string, any> = {};

    for (const key of allowedFields) {
      if (incomingFields[key] !== undefined && incomingFields[key] !== null) {
        updateObj[key] =
          key === "street" ? incomingFields.street : incomingFields[key];
      }
    }

    // If nothing to update
    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    // ==============================================
    // STEP 2: Perform Update
    // ==============================================
    const { data: updatedAddress, error: updateError } = await supabase
      .from("addresses")
      .update(updateObj)
      .eq("id", addressId)
      .eq("userId", userId)
      .select()
      .maybeSingle();

    if (updateError) {
      return res.status(500).json({
        message: "Failed to update address",
        error: updateError,
      });
    }

    return res.status(200).json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      message: "Unexpected server error",
      error,
    });
  }
};
