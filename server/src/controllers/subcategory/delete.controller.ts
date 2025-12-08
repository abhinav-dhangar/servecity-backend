import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express";

export const deleteSubCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: "ID is required" });

    const { data: existing } = await supabase
      .from("subCategories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    const { error } = await supabase
      .from("subCategories")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ message: "Delete failed", error });
    }

    return res.json({ message: "Sub-category deleted" });
  } catch (err) {
    console.error("Delete SubCategory Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
