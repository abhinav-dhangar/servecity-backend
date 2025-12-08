// src/schema/serviceCart.zod.ts

import { z } from "zod";

// -----------------------------
// Preprocessors
// -----------------------------
const toTrimmedString = (v: unknown) => (typeof v === "string" ? v.trim() : v);

const toNumber = (v: unknown) => (typeof v === "string" ? Number(v) : v);

// -----------------------------
// Add Service to Cart Schema
// -----------------------------
export const addServiceToCartSchema = z.object({
  body: z.object({
    serviceId: z.preprocess(
      toNumber,
      z.number().int().positive("serviceId is required")
    ),

    quantity: z.preprocess(
      toNumber,
      z.number().int().min(1, "quantity must be at least 1")
    ),

    date: z.preprocess(
      toTrimmedString,
      z
        .string()
        .min(1, "date is required")
        .refine(
          (val) => !isNaN(Date.parse(val)),
          "date must be a valid date string"
        )
    ),

    timeSlot: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "timeSlot must be in HH:mm format"),
  }),
});

// -------- Type for controller --------
export type AddServiceToCartBody = z.infer<
  typeof addServiceToCartSchema
>["body"];

// 🎯 THIS is what your controller needs
export type ServiceCartItem = AddServiceToCartBody & {
  serviceName?: string;
  image?: string | null;
  servicePrice?: number;
  totalDuration?: string;
};

// -----------------------------
// Update Quantity Schema
// -----------------------------
export const updateServiceQuantitySchema = z.object({
  body: z.object({
    cartItemId: z.string().min(1, "cartItemId is required"),

    quantity: z.preprocess(
      toNumber,
      z.number().int().min(0, "Minimum quantity is 0")
    ),
  }),
});

export type UpdateServiceQuantityBody = z.infer<
  typeof updateServiceQuantitySchema
>["body"];
