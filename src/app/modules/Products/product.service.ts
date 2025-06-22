import { Request } from "express";
import prisma from "../../../shared/prisma";
import { IUploadedFile } from "../../../interfaces/file";
import { uploadFile } from "../../../helpars/fileUploader";

const createProduct = async (req: Request) => {
  const file = req.file as IUploadedFile | undefined;
  const userId = req.user?.id;

  let imageUrl = "";

  if (file) {
    const uploaded = await uploadFile.uploadToCloudinary(file);
    imageUrl = uploaded?.secure_url || "";
  }

  const product = await prisma.product.create({
    data: {
      name: req.body.name || "",
      description: req.body.description || "",
      price: req.body.price || "",
      image: imageUrl,
      inStock: req.body.inStock === true,
      quantity: req.body.quantity ?? 0, // quantity is already number or undefined from zod
      sku: req.body.sku || "",
      discount: req.body.discount || "",
      brandName: req.body.brandName || "",
      brandDesc: req.body.brandDesc || "",
      category: req.body.category || "",
      tags: req.body.tags || "",
      userId: userId!,
    },
  });

  return product;
};


export const ProductService = {
  createProduct,
};
