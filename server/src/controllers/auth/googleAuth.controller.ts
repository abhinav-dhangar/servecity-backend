import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";
require("dotenv").config();
export const googleAuthController = async (req: Request, res: Response) => {
  //   const device_id = req.headers["device-id"] || "unknown_device";
  const deviceId = req.deviceId;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.APP_URL}/auth/callback`,
    },
  });

  res.cookie("oauth_device", deviceId, {
    httpOnly: true,
    secure: process.env.MODE === "prod",
    sameSite: "lax", // or "none" if cross-site and you set secure
    maxAge: 5 * 60 * 1000, // 5 minutes
    path: "/",
  });

  if (error) return res.status(400).json({ error: error.message });

  res.redirect(data.url);
};
