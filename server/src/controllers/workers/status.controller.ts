import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const getWorkerStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const { data: worker, error } = await supabase
      .from("workers")
      .select("isVerified")
      .eq("userId", userId)
      .single();

    // ⚠️ Error code PGRST116 = row not found → treat as "not verified"
    if (error && error.code !== "PGRST116") {
      console.error("Worker Status Error:", error);
      return res.status(500).json({ message: "Failed to retrieve status" });
    }

    // 🟥 Worker does not exist → user never submitted verification
    if (!worker) {
      return res.status(200).json({ status: false });
    }

    // 🟨 Worker exists but is NOT verified
    if (worker.isVerified === false) {
      return res.status(200).json({ status: "pending" });
    }

    // 🟩 Worker is verified
    return res.status(200).json({ status: true });
  } catch (err) {
    console.error("Worker Status Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
