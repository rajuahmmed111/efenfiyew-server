import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import stripe from "../../../helpars/stripe";
import config from "../../../config";

// checkout session
const checkoutSession = async (
  userId: string,
  productIds: string, // comma-separated
  totalPrice: number,
  description: string
) => {
  const productIdArray = productIds.split(",");

  // Validate user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  // Fetch all products
  const products = await prisma.product.findMany({
    where: { id: { in: productIdArray } },
  });

  if (products.length !== productIdArray.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "Some products not found");
  }

  // Build line_items
  const line_items = products.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        description,
        metadata: {
          userId,
          productId: product.id,
        },
      },
      unit_amount: Math.round(product.price * 100), // from DB
    },
    quantity: 1, // or get from frontend payload later if needed
  }));

  const sessionStripe = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${config.frontend_url}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/checkout`,
    metadata: {
      userId,
      productIds: productIds,
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
