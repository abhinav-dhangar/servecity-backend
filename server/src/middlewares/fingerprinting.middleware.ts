import { supabase } from "@utils/supa.conn";
import { NextFunction, Request, Response } from "express";

export const isDeviceFinger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let deviceId = "";
    if (process.env.MODE == "prod") {
      deviceId = (req.headers["deviceId"] as string) || "unknown-device";
    } else {
      deviceId = (req.query.deviceId as string) || "unknown-device";
    }
    if (!deviceId || deviceId == "unknown-device") {
      return res.status(400).json({ error: "Device ID is required" });
    }
    req.deviceId = deviceId;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
