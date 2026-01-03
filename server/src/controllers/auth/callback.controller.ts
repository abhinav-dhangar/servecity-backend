// controllers/auth/authCallback.controller.ts
import { Request, Response } from "express";
import { redisClient } from "@utils/redis.conn";
import { supabase } from "@utils/supa.conn";

export const authCallbackController = async (
  req: Request,
  res: Response
) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Auth code missing" });
    }

    // 🔐 Device ID from cookie (PRIMARY)
    const cookieDeviceId = req.cookies?.oauth_device;
    if (!cookieDeviceId) {
      return res.status(400).json({
        error: "Device context lost. Please retry login.",
      });
    }

    // 🔐 OPTIONAL: validate state
    if (state) {
      const parsed = JSON.parse(
        Buffer.from(state as string, "base64").toString()
      );

      if (parsed.deviceId !== cookieDeviceId) {
        return res.status(403).json({
          error: "Device mismatch detected",
        });
      }
    }

    // 🔁 Exchange code for session
    const { data, error } =
      await supabase.auth.exchangeCodeForSession(
        code.toString()
      );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { user, session } = data;
    if (!user || !session) {
      return res.status(500).json({ error: "Invalid session" });
    }

    // 📦 Store device session in Redis
    const userKey = `user:${user.id}:device:${cookieDeviceId}`;

    await redisClient.hset(userKey, {
      user_id: user.id,
      email: user.email || "",
      deviceId: cookieDeviceId,
      refresh_token: session.refresh_token || "",
      updated_at: new Date().toISOString(),
    });

    // 🧹 Clear OAuth cookie
    res.clearCookie("oauth_device", { path: "/" });

    return res.json({
      message: "OAuth login successful",
      userId: user.id,
      deviceId: cookieDeviceId,
    });
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
