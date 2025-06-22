import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// create review
const createReview = async (
  userId: string,
  productId: string,
  payload: { rating: number; review: string }
) => {
  // check product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  // check user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // create review
  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      rating: payload.rating,
      review: payload.review,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
    },
  });

  return review;
};

// get all reviews
const getAllReviews = async () => {
  const reviews = await prisma.review.findMany();
  return reviews;
};

// get my reviews
const getMyReviews = async (userId: string) => {
  const reviews = await prisma.review.findMany({
    where: { userId },
  });
  if (!reviews) {
    throw new ApiError(httpStatus.NOT_FOUND, "Reviews not found");
  }

  return reviews;
};

export const ReviewService = { createReview, getAllReviews, getMyReviews };
