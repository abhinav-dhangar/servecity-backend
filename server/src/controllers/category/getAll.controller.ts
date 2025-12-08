import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";

export const getCategoriesController = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return res.status(500).json({
        message: "Failed to get categories",
        error,
      });
    }

    return res.json({
      message: "Categories fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Get Categories Error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err,
    }); 
  }
};
