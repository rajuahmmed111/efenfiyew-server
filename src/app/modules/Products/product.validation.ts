import { z } from "zod";

 const productSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),

    price: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional(),

    inStock: z
      .union([z.string(), z.boolean()])
      .transform((val) => val === "true" || val === true)
      .optional(),

    quantity: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional(),

    discount: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional(),

    sku: z.string().optional(),
    brandName: z.string().optional(),
    brandDesc: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
  }),
});


const updateProductSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    image: z.string().optional(),
    inStock: z.boolean().optional(),
    quantity: z.number().optional(),
    sku: z.string().optional(),
    discount: z.number().optional(),
    brandName: z.string().optional(),
    brandDesc: z.string().optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
  }),
});

export const ProductValidation = {
  productSchema,
  updateProductSchema,
};
