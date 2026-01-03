import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";

export const signupControllerWorker = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `http://localhost:3001`,
    },
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user });
};
