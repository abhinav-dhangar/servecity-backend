import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const getWorkerProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // 👈 authenticated user

    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Get Worker Profile Error:", error);
      return res.status(500).json({ message: "Failed to fetch worker profile" });
    }

    return res.status(200).json({
      message: "Worker profile fetched",
      profile: data ?? null, // returns null if not created
    });
  } catch (err) {
    console.error("Get Worker Profile Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
