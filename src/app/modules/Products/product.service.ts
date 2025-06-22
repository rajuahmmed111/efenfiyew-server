import { Request } from "express";
import prisma from "../../../shared/prisma";
import { IUploadedFile } from "../../../interfaces/file";
import { uploadFile } from "../../../helpars/fileUploader";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { calculatedPagination } from "../../../helpars/calculatePagination";
import { Prisma, Product } from "@prisma/client";
import { IProductFilterRequest } from "./product.interfaee";
import { productSearchableFields } from "./product.constant";

const createProduct = async (req: Request) => {
  const file = req.file as IUploadedFile | undefined;
  const userId = req.user?.id;

  let imageUrl = "";

  if (file) {
    const uploadedImage = await uploadFile.uploadToCloudinary(file);
    imageUrl = uploadedImage?.secure_url || "";
  }

  const {
    name,
    description,
    price,
    inStock,
    quantity,
    sku,
    discount,
    brandName,
    brandDesc,
    category,
    tags,
  } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      image: imageUrl,
      inStock,
      quantity,
      sku,
      discount,
      brandName,
      brandDesc,
      category,
      tags,
      userId,
    },
  });

  return product;
};

// get all products
const getAllProducts = async (
  params: IProductFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    calculatedPagination(options);

  const { searchTerm, ...filterData } = params;

  const filters: Prisma.ProductWhereInput[] = [];

  // text search
  if (params?.searchTerm) {
    filters.push({
      OR: productSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // filter
  const filterFieldTypes: Record<string, "string" | "number"> = {
    price: "number",
    rating: "number",
    category: "string",
    tags: "string",
  };

  if (Object.keys(filterData).length > 0) {
    const andConditions: Prisma.ProductWhereInput[] = Object.entries(
      filterData
    ).reduce((acc: Prisma.ProductWhereInput[], [key, value]) => {
      if (value === undefined) return acc;

      const expectedType = filterFieldTypes[key];
      let castedValue: any = value;

      if (expectedType === "number") {
        castedValue = parseFloat(value);
        if (isNaN(castedValue)) return acc;
      }

      // for tags
      if (key === "tags") {
        acc.push({
          tags: {
            contains: castedValue,
            mode: "insensitive",
          },
        });
      } else {
        acc.push({
          [key]: {
            equals: castedValue,
          },
        });
      }

      return acc;
    }, []);

    if (andConditions.length > 0) {
      filters.push({ AND: andConditions });
    }
  }

  const where: Prisma.ProductWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const result = await prisma.product.findMany({
    where,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.product.count({
    where,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

// get product by id
const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product;
};

// get single product with related data through category
const getProductByIdWithRelatedData = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      inStock: true,
      quantity: true,
      discount: true,
      brandName: true,
      brandDesc: true,
      category: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
    },
    take: 6,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      inStock: true,
      quantity: true,
      discount: true,
      brandName: true,
      brandDesc: true,
      category: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    product,
    relatedProducts,
  };
};

// update product
const updateProduct = async (req: Request) => {
  const { id } = req.params;
  const file = req.file as IUploadedFile | undefined;

  let imageUrl = undefined;

  // ⬆️ Upload new image if provided
  if (file) {
    const uploadedImage = await uploadFile.uploadToCloudinary(file);
    imageUrl = uploadedImage?.secure_url;
  }

  const {
    name,
    description,
    price,
    inStock,
    quantity,
    sku,
    discount,
    brandName,
    brandDesc,
    category,
    tags,
  } = req.body;

  //  update data object
  const updateData: any = {
    ...(name && { name }),
    ...(description && { description }),
    ...(price !== undefined && { price: parseFloat(price) }),
    ...(inStock !== undefined && {
      inStock: inStock === "true" || inStock === true,
    }),
    ...(quantity !== undefined && { quantity: parseInt(quantity) }),
    ...(sku && { sku }),
    ...(discount !== undefined && { discount: parseFloat(discount) }),
    ...(brandName && { brandName }),
    ...(brandDesc && { brandDesc }),
    ...(category && { category }),
    ...(tags && { tags }),
    ...(imageUrl && { image: imageUrl }),
  };

  const updatedProduct = await prisma.product.update({
    where: {
      id,
    },
    data: updateData,
  });

  return updatedProduct;
};

// delete product
const deleteProduct = async (id: string) => {
  const result = await prisma.product.delete({
    where: { id },
  });
  return result;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductByIdWithRelatedData,
  updateProduct,
  deleteProduct,
};
