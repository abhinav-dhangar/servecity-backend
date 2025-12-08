import { z } from "zod";

export const createSubCategorySchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    categoryId: z.number(),
  }),
});

export const updateSubCategorySchema = z.object({
  body: z.object({
    id: z.number(),
    title: z.string().optional(),
    categoryId: z.number().optional(),
  }),
});
