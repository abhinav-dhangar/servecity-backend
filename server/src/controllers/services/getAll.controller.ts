import { supabase } from "@utils/supa.conn";
import { Request, Response } from "express`";
export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    const { data, error } = await supabase
      .from("subCategories")
      .select(
        `
        id,
        title,
        image,
        services:services (
          id,
          title,
          price,
          image,
          totalDuration,
          description,
          weNeed,
          faqs,
          process,
          categoryId,
          subCategoryId
        )
      `
      )
      .eq("categoryId", categoryId);

    if (error) throw error;

    return res.json({
      categoryId,
      data: data.map((sub) => ({
        subCategoryId: sub.id,
        subCategoryTitle: sub.title,
        subCategoryImage: sub.image,
        services: sub.services,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllServicesController = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        id,
        title,
        description,
        image,
        price,
        totalDuration,
        weNeed,
        faqs,
        process,
        categoryId,
        subCategoryId,
        subCategories:subCategories (
          id,
          title,
          image,
          categoryId
        ),
        categories:categories (
          id,
          title,
          image
        )
      `
      )
      .order("id", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      total: data.length,
      services: data.map((svc) => ({
        id: svc.id,
        title: svc.title,
        description: svc.description,
        image: svc.image,
        price: svc.price,
        totalDuration: svc.totalDuration,
        weNeed: svc.weNeed,
        faqs: svc.faqs,
        process: svc.process,

        category: svc.categories
          ? {
              id: svc.categories.id,
              title: svc.categories.title,
              image: svc.categories.image,
            }
          : null,

        subCategory: svc.subCategories
          ? {
              id: svc.subCategories.id,
              title: svc.subCategories.title,
              image: svc.subCategories.image,
            }
          : null,
      })),
    });
  } catch (err) {
    console.error("Get all services error:", err);
    return res.status(500).json({
      message: "Failed to fetch services",
      error: err.message,
    });
  }
};

// controllers/services/getRandomServices.controller.ts

export const getRandomServicesController = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const { data, error } = await supabase
      .from("services")
      .select(
        `
        id,
        title,
        description,
        image,
        price,
        totalDuration
      `
      )
      // .order("random") // 🔥 RANDOM ORDER
      .limit(limit);

    if (error) throw error;

    return res.status(200).json({
      data,
    });
  } catch (err) {
    console.error("Create SubCategory Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
