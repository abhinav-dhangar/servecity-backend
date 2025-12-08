import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";

export const getSubCategoriesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { categoryId } = req.query;

    const query = supabase.from("subCategories").select("*");

    if (categoryId) query.eq("categoryId", Number(categoryId));

    const { data, error } = await query.order("id");

    if (error) {
      return res.status(500).json({ message: "Fetch failed", error });
    }

    return res.json({ data });
  } catch (err) {
    console.error("Get SubCategories Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
