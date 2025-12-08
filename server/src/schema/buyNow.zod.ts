// src/schema/buyNow.zod.ts

import { z } from "zod";

// Preprocessors
const toNumber = (v: unknown) => (typeof v === "string" ? Number(v) : v);

// ---------------------------
// Variant Schema
// ---------------------------
export const variantSchema = z.object({
  type: z.string().min(1, "Variant type is required"),
  value: z.string().min(1, "Variant value is required"),
});

// ---------------------------
// BUY NOW Schema
// ---------------------------
export const buyNowSchema = z.object({
  body: z.object({
    productId: z.preprocess(
      toNumber,
      z.number().int().positive("productId is required")
    ),

    quantity: z.preprocess(
      toNumber,
      z.number().int().min(1, "Quantity must be at least 1")
    ),

    addressId: z.string().uuid("addressId must be a valid UUID"),

    paymentMethod: z.enum(["cod", "online"], {
      message: "paymentMethod must be either 'cod' or 'online'",
    }),

    // Optional — only required if product has variants
    variant: variantSchema.optional(),
  }),
});

// ---------------------------
// Type for Controller Usage
// ---------------------------
export type BuyNowDto = z.infer<typeof buyNowSchema>["body"];
