import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

export const resendConfirmationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Supabase resend function
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "New confirmation email sent" });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
