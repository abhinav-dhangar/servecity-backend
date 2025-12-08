// controllers/auth/getCurrentUser.controller.ts
import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";
import { redisClient } from "@utils/redis.conn";
import { profile } from "console";

export const getCurrentUserController = async (req: Request, res: Response) => {
  try {
    // You already attach:
    // req.user → decoded user from Supabase
    // req.deviceId → from interceptor/middleware
    const user = req.user;
    const deviceId = req.deviceId;

    if (!user || !user.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get Redis session for this device
    const userKey = `user:${user.id}:device:${deviceId}`;
    const sessionData = await redisClient.hgetall(userKey);

    // Optional: fetch profile table
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("userId", user.id)
      .maybeSingle();
      
      console.log("profile is : ")
    console.log(profileData);
    return res.json({
      message: "User fetched successfully",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
      deviceId,
      profile: profileData || null,
    });
  } catch (err) {
    console.error("Get Current User error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
