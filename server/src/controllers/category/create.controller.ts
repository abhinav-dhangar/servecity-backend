import { createCategorySchema } from "@src/schema/category.zod";
import { supabase } from "@utils/supa.conn";
import { uploadFileToSupabase } from "@utils/uploadFilesToSupabse";
import { Request, Response } from "express";


export const createCategoryController = async (req: Request, res: Response) => {
  try {

    // Validate body
    const parsed = createCategorySchema.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid category data",
        errors: parsed.error.flatten(),
      });
    }

    const { categoryName } = parsed.data.body;

    // =========================
    // Handle Uploads
    // =========================
    let videoUrl: string | null = null;
    let imageUrls: string[] = [];

    if (req.files && "video" in req.files && req.files.video[0]) {
      videoUrl = await uploadFileToSupabase(req.files.video[0], "videos");
    }

    if (req.files && "images" in req.files) {
      for (const img of req.files.images) {
        const uploaded = await uploadFileToSupabase(img, "images");
        imageUrls.push(uploaded);
      }
    }

    // =========================
    // Insert into DB
    // =========================
    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          categoryName,
          videoUrl,
          images: imageUrls,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: "Failed to create category", error });
    }

    return res.status(201).json({
      message: "Category created successfully",
      data,
    });

  } catch (err) {
    console.error("Create Category Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
