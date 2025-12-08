import { Request, Response } from "express";
import { supabase } from "@utils/supa.conn";

import { uploadFileToSupabase } from "@utils/uploadFilesToSupabse";
import { createSubCategorySchema } from "@src/schema/subCategory.zod";

export const createSubCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = createSubCategorySchema.safeParse({ body: req.body });

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid sub-category data",
        errors: parsed.error.flatten(),
      });
    }

    const { title, categoryId } = parsed.data.body;

    // =====================
    // UPLOAD IMAGE
    // =====================
    let imageUrl: string | null = null;

    if (req.file) {
      imageUrl = await uploadFileToSupabase(req.file, "subcategories");
    }

    // =====================
    // INSERT INTO DB
    // =====================
    const { data, error } = await supabase
      .from("subCategories")
      .insert([
        {
          title,
          image: imageUrl,
          categoryId,
        },
      ])
      .select()
      .single();

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to create sub-category", error });
    }

    return res.status(201).json({
      message: "Sub-category created successfully",
      data,
    });
  } catch (err) {
    console.error("Create SubCategory Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
