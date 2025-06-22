import { z } from "zod";

export const productSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.string().optional(),

    inStock: z
      .string()
      .optional()
      .transform((val) => val === "true"),

    quantity: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const parsed = Number(val);
        if (isNaN(parsed)) throw new Error("Quantity must be a number");
        return parsed;
      })
      .refine((val) => val === undefined || Number.isInteger(val), {
        message: "Quantity must be an integer",
      }),

    sku: z.string().optional(),
    discount: z.string().optional(),
    brandName: z.string().optional(),
    brandDesc: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
  }),
});

export const ProductValidation = {
  productSchema,
};
