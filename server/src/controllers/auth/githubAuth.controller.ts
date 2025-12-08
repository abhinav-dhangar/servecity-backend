import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";
require("dotenv").config();
export const githubAuthController = async (req: Request, res: Response) => {
  const deviceId = req.deviceId;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.APP_URL}/auth/callback`,
      queryParams: {
        prompt: "consent",
        access_type: "offline",
        response_mode: "query", // 🔥 forces `?code=` instead of `#token`
      },
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
