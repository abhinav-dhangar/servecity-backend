// controllers/auth/login.controller.ts
import { redisClient } from "@utils/redis.conn";
import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";
require("dotenv").config();

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const deviceId: string = req.deviceId;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      return res.status(400).json({ error: error?.message || "Login failed" });
    }

    // Set short-lived cookie (not critical, mostly for OAuth-style flows)
    res.cookie("oauth_device", deviceId, {
      httpOnly: true,
      secure: process.env.MODE === "prod",
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
      path: "/",
    });

    const userKey = `user:${data.user.id}:device:${deviceId}`;

    await redisClient.hset(userKey, {
      user_id: data.user.id,
      email: data.user.email || "",
      deviceId,
      updated_at: new Date().toISOString(),
      refresh_token: data.session.refresh_token, // rotation
    });

    return res.json({
      message: "Login successful",
      session: data.session,
      user: data.user,

      deviceId,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
