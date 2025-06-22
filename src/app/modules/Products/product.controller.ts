import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ProductService } from "./product.service";
import { pick } from "../../../shared/pick";
import { filterField } from "./product.constant";
import { paginationFields } from "../../../constants/pagination";

const createProduct = catchAsync(async (req, res) => {
  const result = await ProductService.createProduct(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

// get all products
const getAllProducts = catchAsync(async (req, res) => {
      const filter = pick(req.query, filterField);
  const options = pick(req.query, paginationFields);
  const result = await ProductService.getAllProducts(filter, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
});

// get product by id
const getProductById = catchAsync(async (req, res) => {
  const result = await ProductService.getProductById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

// get single product with related data through category
const getProductByIdWithRelatedData = catchAsync(async (req, res) => {
  const result = await ProductService.getProductByIdWithRelatedData(
    req.params.id
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

// update product
const updateProduct = catchAsync(async (req, res) => {
  const result = await ProductService.updateProduct(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
})

// delete product
const deleteProduct = catchAsync(async (req, res) => {
  const result = await ProductService.deleteProduct(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
})

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductByIdWithRelatedData,
  updateProduct,
  deleteProduct
};
