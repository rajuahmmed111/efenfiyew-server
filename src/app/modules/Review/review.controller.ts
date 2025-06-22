import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const productId = req.params.productId;
  const result = await ReviewService.createReview(userId, productId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

// get all reviews
const getAllReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getAllReviews();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

// get my reviews
const getMyReviews = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const result = await ReviewService.getMyReviews(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My reviews retrieved successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getMyReviews,
};
