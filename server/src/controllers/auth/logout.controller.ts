// controllers/auth/logout.controller.ts

import { Request, Response } from "express";
import { redisClient } from "@utils/redis.conn";

export const logoutController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const deviceId = req.deviceId;

    if (!userId || !deviceId) {
      return res.status(400).json({ error: "Invalid user or device" });
    }

    // Redis session key pattern:
    const userKey = `user:${userId}:device:${deviceId}`;

    // Delete Redis session for this device only
    await redisClient.del(userKey);

    // Clear cookie (optional but recommended)
    res.clearCookie("oauth_device", {
      httpOnly: true,
      secure: process.env.MODE === "prod",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
      deviceId,
    });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
