import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";

import stripe from "../../../helpars/stripe";

import config from "../../../config";

// checkout session
const checkoutSession = async (
  userId: string,
  price: number,
  description: string
) => {
  // validation user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "user not found");
  }

  const sessionStripe: any = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "subscription services",
            description: description,
            metadata: {
              userId: userId,
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
  });

  return {
    checkoutUrl: sessionStripe.url,
    sessionId: sessionStripe.id,
  };
};

export const subscriptionPlanService = {
  checkoutSession,
};
