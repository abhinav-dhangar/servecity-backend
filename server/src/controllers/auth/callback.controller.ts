import { Request, Response } from "express";
import { redisClient } from "@utils/redis.conn";
import { supabase } from "@utils/supa.conn";

export const authCallbackController = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    console.log("OAuth Device Cookie: \n");
    console.log(req.cookies.oauth_device);
    console.log("Callback query:", req.query);

    if (!code) {
      return res.status(400).json({ error: "Auth code missing" });
    }

    const deviceId = req.cookies?.oauth_device as string | undefined;
    if (!deviceId) {
      // fallback: handle gracefully or reject
      console.warn("No oauth_device cookie");
    }
    // Exchange OAuth code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code.toString()
    );

    if (error) {
      console.error("⛔ exchange error:", error);
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;
    const session = data.session;

    if (!user || !session) {
      return res.status(500).json({ error: "Invalid session from provider" });
    }

    // Redis key per device
    const userKey = `user:${user.id}:device:${deviceId}`;

    // Always update refresh token (token rotation)
    await redisClient.hset(userKey, {
      user_id: user.id,
      email: user.email || "",
      deviceId: deviceId.toString(),
      updated_at: new Date().toISOString(),
      refresh_token: session.refresh_token || "",
    });

    console.log("🎉 OAuth Login:", {
      user: user.email,
      deviceId,
      refreshed: session.refresh_token,
    });

    // Redirect or respond
    return res.status(200).json({
      message: "OAuth Login successful",
      deviceId,
      user_id: user.id,
    });
  } catch (err) {
    console.error("Callback error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
