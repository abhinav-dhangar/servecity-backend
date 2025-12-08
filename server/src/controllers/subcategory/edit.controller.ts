import { Request, Response } from "express";

import { supabase } from "@utils/supa.conn";
import { uploadFileToSupabase } from "@utils/uploadFilesToSupabse";
import { updateSubCategorySchema } from "@src/schema/subCategory.zod";

export const updateSubCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = updateSubCategorySchema.safeParse({ body: req.body });

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const { id, title, categoryId } = parsed.data.body;

    // Check if exists
    const { data: existing } = await supabase
      .from("subCategories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    // Upload new image only if provided
    let newImage = existing.image;

    if (req.file) {
      newImage = await uploadFileToSupabase(req.file, "subcategories");
    }

    // update DB
    const { data, error } = await supabase
      .from("subCategories")
      .update({
        title: title ?? existing.title,
        categoryId: categoryId ?? existing.categoryId,
        image: newImage,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: "Failed to update", error });
    }

    return res.json({ message: "Sub-category updated", data });
  } catch (err) {
    console.error("Update SubCategory Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
