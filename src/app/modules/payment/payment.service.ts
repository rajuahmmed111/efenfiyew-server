import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import stripe from "../../../helpars/stripe";
import config from "../../../config";

// checkout session
const checkoutSession = async (
  userId: string,
  productId: string,
  price: number,
  description: string
) => {
  // validate user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // validate product
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  // create Stripe checkout session
  const sessionStripe = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: description,
            metadata: {
              userId,
              productId,
            },
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.frontend_url}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/cancel`,
    metadata: {
      userId,
      productId,
      description,
    },
  });

  return {
    checkoutUrl: sessionStripe.url,
    sessionId: sessionStripe.id,
  };
};

export const subscriptionPlanService = {
  checkoutSession,
};
