import { z } from "zod";

export const verificationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name required"),
    phone: z.string().min(10, "Phone number required"),
    houseDetails: z.string().min(3, "House details required"),
    city: z.string().min(2, "City required"),
    state: z.string().min(2, "State required"),
    pincode: z.string().min(5, "Pincode required"),
    categoryId: z.string().min(1, "Category is required"),
    subCategoryId: z.string().min(1, "Subcategory is required"),
  }),
});
