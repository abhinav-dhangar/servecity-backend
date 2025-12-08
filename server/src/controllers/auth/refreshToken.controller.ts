import { redisClient } from "@utils/redis.conn";
import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const deviceId = req.deviceId as string;

    if (!deviceId) {
      return res.status(400).json({ error: "Device ID missing" });
    }

    // 1. Fetch refresh token from Redis
    const keys = await redisClient.keys(`user:*:device:${deviceId}`);
    if (!keys || keys.length === 0) {
      return res.status(401).json({ error: "No session found. Login again." });
    }

    const userKey = keys[0];
    const session = await redisClient.hgetall(userKey);

    const oldRefreshToken = session.refresh_token;
    if (!oldRefreshToken) {
      return res
        .status(401)
        .json({ error: "Missing refresh token. Login again." });
    }

    // 2. Exchange refresh token with Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: oldRefreshToken,
    });

    if (error || !data.session) {
      return res
        .status(401)
        .json({ error: "Invalid refresh token. Login again." });
    }

    const { session: newSession } = data;
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);
    if (profileData?.length == 0) {
      res.status(400).send({ error: "profile does not found" });
    }
    let user = profileData[0];

    // 3. Save new refresh token in Redis (but DO NOT send it to client)
    await redisClient.hset(userKey, {
      refresh_token: newSession.refresh_token,
      updated_at: new Date().toISOString(),
    });

    // 4. Return access token + user
    return res.json({
      message: "Token refreshed",
      access_token: newSession.access_token,
      expires_in: newSession.expires_in,
      user, // ← included user here
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
