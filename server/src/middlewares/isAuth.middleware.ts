import { supabase } from "@utils/supa.conn";
import { NextFunction, Request, Response } from "express";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let deviceId = "";
    let token = "";
    if (process.env.MODE == "prod") {
      if (authHeader) token = authHeader.split(" ")[1];
      deviceId = (req.headers["deviceId"] as string) || "unknown-device";
      if (!authHeader)
        return res.status(401).json({ error: "Authorization header missing" });
    } else {
      deviceId = (req.query.deviceId as string) || "unknown-device";
      token = req.query.code as string;
    }
    if (!deviceId || deviceId == "unknown-device") {
      return res.status(400).json({ error: "Device ID is required" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user)
      return res.status(401).json({ error: "Invalid or expired token" });

    req.user = data.user;
    req.deviceId = deviceId;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
