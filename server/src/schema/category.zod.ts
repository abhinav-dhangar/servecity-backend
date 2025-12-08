import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    categoryName: z.string().min(1),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    id: z.number(),
    categoryName: z.string().optional(),
  }),
});
