import { z } from "zod";

export const productSchema = z.object({
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
