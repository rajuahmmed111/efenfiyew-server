import express from "express";
import { ProductController } from "./product.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { uploadFile } from "../../../helpars/fileUploader";
import validateRequest from "../../middlewares/validateRequest";
import { ProductValidation } from "./product.validation";
import { parseBodyData } from "../../middlewares/parseNestedJson";

const router = express.Router();

// get all products without pagination and filtering
router.get("/", auth(), ProductController.getAllProducts);

// get single product
router.get("/:id", /*auth(),**/ ProductController.getProductById);

// get single product with related data through category
router.get(
  "/:id/related",
  // auth(),
  ProductController.getProductByIdWithRelatedData
);

router.post(
  "/",
  auth(UserRole.FARMER),
  uploadFile.productImage,
  parseBodyData,
  validateRequest(ProductValidation.productSchema),
  ProductController.createProduct
);

// update product
router.patch(
  "/:id",
  //   auth(UserRole.FARMER),
  uploadFile.productImage,
  parseBodyData,
  validateRequest(ProductValidation.updateProductSchema),
  ProductController.updateProduct
);

// delete product
router.delete(
  "/:id",
  /*auth(UserRole.FARMER),**/ ProductController.deleteProduct
);

export const productRoute = router;
