import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { subscriptionPlanService } from "./payment.service";
import Stripe from "stripe";
import stripe from "../../../helpars/stripe";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// checkout session
const checkoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { price, description, productId } = req.body;

  const result = await subscriptionPlanService.checkoutSession(
    userId,
    productId,
    price,
    description
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Checkout session created successfully",
    data: result,
  });
});

// stripe webhook
const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  if (!sig) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing stripe signature", "");
  }

  let event: Stripe.Event;

  try {
    if (!req.rawBody) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Raw body not available", "");
    }

    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      config.stripe.webhookSecret as string
    );
  } catch (err: any) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook Error: ${err.message}`,
      ""
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const productIdsStr = session.metadata?.productIds;
      const description = session.metadata?.description || "No description";

      const productIds = productIdsStr?.split(",") || [];

      const paymentIntentId = session.payment_intent as string;
      const sessionId = session.id;

      const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert cents to dollars
      const currency = session.currency ?? "usd";

      const customerEmail = session.customer_details?.email || null;
      const customerName = session.customer_details?.name || null;

      if (!userId || productIds.length === 0) {
        console.warn("Missing metadata in Stripe session");
        break;
      }

      // Save payment to database
      await prisma.payment.create({
        data: {
          userId,
          productIds,
          amount,
          currency,
          status: session.payment_status || "UNKNOWN",
          provider: "STRIPE",
          paymentIntentId,
          sessionId,
          description,
          email: customerEmail,
          customerName,
        },
      });

      console.log("Payment saved to database via webhook");
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Invoice payment succeeded:", invoice.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

export const stripeController = {
  checkoutSession,
  handleStripeWebhook,
};
