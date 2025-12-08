// src/controllers/categories/getCategoryById.controller.ts
import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";

export const getCategoryByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Category ID is required",
      });
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single(); // ensures only one row

    if (error) {
      return res.status(500).json({
        message: "Failed to fetch category",
        error,
      });
    }

    if (!data) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.json({
      message: "Category fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Get Category By ID Error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err,
    });
  }
};
