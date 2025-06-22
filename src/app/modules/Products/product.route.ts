import express from "express";
import { ProductController } from "./product.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { uploadFile } from "../../../helpars/fileUploader";
import validateRequest from "../../middlewares/validateRequest";
import { ProductValidation } from "./product.validation";

const router = express.Router();


router.post(
  "/",
  auth(UserRole.FARMER),
  uploadFile.productImage,
  validateRequest(ProductValidation.productSchema),
  ProductController.createProduct
);

export const productRoute = router;
