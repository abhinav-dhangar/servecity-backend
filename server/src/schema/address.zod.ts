//make accordimg to this ;const { street, city, state, pinCode, country,phone,fullName } = req.body;

import { z } from "zod";
const trim = (val: unknown) => (typeof val === "string" ? val.trim() : val);

export const addressSchema = z.object({
  body: z.object({
    street: z.preprocess(
      trim,
      z.string().min(1, "Street is required").max(200, "Street is too long")
    ),
    city: z.preprocess(
      trim,
      z
        .string()
        .min(1, "City is required")
        .max(100, "City is too long")
        .regex(/^[\p{L}\s.'-]+$/u, "Invalid city name")
    ),
    state: z.preprocess(
      trim,
      z.string().min(1, "State is required").max(100, "State is too long")
    ),
    pinCode: z.preprocess(
      trim,
      z
        .string()
        .min(1, "Pin Code is required")
        .regex(/^[A-Za-z0-9\- ]{3,12}$/, "Invalid pin/postal code")
    ),

    phone: z.preprocess(
      trim,
      z
        .string()
        .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number (use E.164 format)")
    ),
    fullName: z.preprocess(
      trim,
      z
        .string()
        .min(2, "Full name is required")
        .max(100, "Full name is too long")
        .regex(/^[\p{L}\s.'-]+$/u, "Invalid full name")
    ),
  }),
});

export type Address = z.infer<typeof addressSchema>;
export const createAddressSchema = addressSchema;
export const updateAddressSchema = addressSchema.partial();
