// controllers/auth/googleAuth.controller.ts
import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

export const googleAuthController = async (req: Request, res: Response) => {
  const deviceId =
    req.deviceId ||
    (req.headers["deviceid"] as string) ||
    randomUUID();

  // 🔐 Store deviceId in secure cookie
  res.cookie("oauth_device", deviceId, {
    httpOnly: true,
    secure: process.env.MODE === "prod",
    sameSite: "lax",
    maxAge: 5 * 60 * 1000, // 5 minutes
    path: "/",
  });

  // OPTIONAL: Add state (recommended)
  const state = Buffer.from(
    JSON.stringify({ deviceId })
  ).toString("base64");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.APP_URL}/auth/callback`,
      queryParams: { state },
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.redirect(data.url);
};
