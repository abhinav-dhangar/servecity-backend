import { supabase } from "@utils/supa.conn";
import { NextFunction, Request, Response } from "express";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;
    let deviceId: string | undefined;

    const authHeader = req.headers.authorization;

    // -------------------------
    // PROD MODE
    // -------------------------
    if (process.env.MODE === "prod") {
      if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
      }

      token = authHeader.split(" ")[1];
      deviceId = req.headers["deviceid"] as string;
    }

    // -------------------------
    // DEV / LOCAL MODE
    // -------------------------
    else {
      token = req.query.code as string;
      deviceId = req.query.deviceId as string;
    }

    // -------------------------
    // VALIDATIONS
    // -------------------------
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    if (!deviceId) {
      return res.status(400).json({ error: "Device ID is required" });
    }

    // -------------------------
    // VERIFY TOKEN
    // -------------------------
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // -------------------------
    // ATTACH TO REQUEST
    // -------------------------
    req.user = data.user;
    req.deviceId = deviceId;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};