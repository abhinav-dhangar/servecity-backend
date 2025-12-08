import { z } from "zod";

const trim = (val: unknown) => (typeof val === "string" ? val.trim() : val);

export const updateAddressSchema = z.object({
  body: z.object({
    addressId: z.preprocess(trim, z.string().min(1, "addressId is required")),

    street: z.preprocess(trim, z.string().min(1).max(200)).optional(),

    city: z
      .preprocess(
        trim,
        z
          .string()
          .min(1)
          .max(100)
          .regex(/^[\p{L}\s.'-]+$/u, "Invalid city name")
      )
      .optional(),

    state: z.preprocess(trim, z.string().min(1).max(100)).optional(),

    pinCode: z
      .preprocess(
        trim,
        z
          .string()
          .min(1)
          .regex(/^[A-Za-z0-9\- ]{3,12}$/, "Invalid pin/postal code")
      )
      .optional(),

    phone: z
      .preprocess(
        trim,
        z
          .string()
          .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number (E.164 format)")
      )
      .optional(),

    fullName: z
      .preprocess(
        trim,
        z
          .string()
          .min(2)
          .max(100)
          .regex(/^[\p{L}\s.'-]+$/u, "Invalid full name")
      )
      .optional(),
  }),
});

export type UpdateAddress = z.infer<typeof updateAddressSchema>;
