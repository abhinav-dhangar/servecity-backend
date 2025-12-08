// src/schema/serviceCart.zod.ts
import { z } from "zod";

const toTrimmedString = (v: unknown) => (typeof v === "string" ? v.trim() : v);
const toNumber = (v: unknown) => (typeof v === "string" ? Number(v) : v);

// Single service cart item
export const serviceCartItemSchema = z.object({
  serviceId: z.preprocess(
    toNumber,
    z.number().int().positive("serviceId must be a valid number")
  ),

  quantity: z.preprocess(
    toNumber,
    z.number().int().min(1, "quantity must be at least 1")
  ),

  // timeSlot mandatory → ISO string expected
  timeSlot: z.preprocess(
    toTrimmedString,
    z.string().min(1, "timeSlot is required")
  ),
});

export const serviceCartArraySchema = z.array(serviceCartItemSchema);

// Request-level schema
export const addServiceToCartSchema = z.object({
  body: serviceCartItemSchema,
});

export type ServiceCartItem = z.infer<typeof serviceCartItemSchema>;
export type ServiceCartArray = z.infer<typeof serviceCartArraySchema>;

// src/schema/serviceCart.zod.ts (append these)

export const removeServiceFromCartSchema = z.object({
  body: z.object({
    serviceId: z.preprocess(
      toNumber,
      z.number().int().positive("serviceId is required")
    ),
  }),
});

export const updateServiceCartFromFrontendSchema = z.object({
  body: z.object({
    items: serviceCartArraySchema,
  }),
});

// src/schema/serviceCart.zod.ts (append this)

export const updateServiceQuantitySchema = z.object({
  body: z.object({
    serviceId: z.preprocess(
      toNumber,
      z.number().int().positive("serviceId is required")
    ),

    timeSlot: z.preprocess(
      toTrimmedString,
      z.string().min(1, "timeSlot is required")
    ),

    quantity: z.preprocess(
      toNumber,
      z.number().int().min(-50).max(50) // allow +/- changes
    ),
  }),
});
