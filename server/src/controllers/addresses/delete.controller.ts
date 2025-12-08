import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const deleteAddressController = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    if (!addressId) {
      return res.status(400).json({ message: "addressId is required" });
    }

    // ==============================================
    // STEP 0: Check if address exists & belongs to user
    // ==============================================
    const { data: existingAddress, error: checkError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("userId", userId)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({
        message: "Error fetching address",
        error: checkError,
      });
    }

    if (!existingAddress) {
      return res.status(404).json({
        message: "Address not found or does not belong to this user",
      });
    }

    // ==============================================
    // STEP 1: Delete Address
    // ==============================================
    const { error: deleteError } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("userId", userId);

      

    if (deleteError) {
      return res.status(500).json({
        message: "Failed to delete address",
        error: deleteError,
      });
    }

    return res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};
