 import { Request, Response } from "express";

import { supabase } from "@utils/supa.conn";
import { updateCategorySchema } from "@src/schema/category.zod";
import { uploadFileToSupabase } from "@utils/uploadFilesToSupabse";

export const updateCategoryController = async (req: Request, res: Response) => {
  try {
    const parsed = updateCategorySchema.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid update data" });
    }

    const { id, categoryName } = parsed.data.body;

    // Fetch existing
    const { data: existing } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    // ============= UPLOADS =============
    let newVideoUrl = existing.videoUrl;
    let newImageUrls = existing.images || [];

    if (req.files && "video" in req.files && req.files.video[0]) {
      newVideoUrl = await uploadFileToSupabase(req.files.video[0], "videos");
    }

    if (req.files && "images" in req.files) {
      newImageUrls = [];
      for (const img of req.files.images) {
        const uploaded = await uploadFileToSupabase(img, "images");
        newImageUrls.push(uploaded);
      }
    }

    // ============= UPDATE DB =============
    const { data, error } = await supabase
      .from("categories")
      .update({
        categoryName: categoryName ?? existing.categoryName,
        videoUrl: newVideoUrl,
        images: newImageUrls,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        message: "Failed to update category",
        error,
      });
    }

    return res.json({ message: "Category updated", data });

  } catch (err) {
    console.error("Update Category Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
