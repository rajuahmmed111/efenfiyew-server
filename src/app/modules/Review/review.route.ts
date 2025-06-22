import express from "express";
import auth from "../../middlewares/auth";
import { ReviewController } from "./review.controller";
import { UserRole } from "@prisma/client";

const router = express.Router();

// get all reviews
router.get("/", auth(UserRole.USER), ReviewController.getAllReviews);

// get my reviews
router.get("/my", auth(UserRole.USER), ReviewController.getMyReviews);

// create review
router.post("/:productId", auth(UserRole.USER), ReviewController.createReview);

export const reviewRoute = router;
