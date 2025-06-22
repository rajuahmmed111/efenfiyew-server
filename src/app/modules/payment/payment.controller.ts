import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { subscriptionPlanService } from "./payment.service";
import Stripe from "stripe";
import stripe from "../../../helpars/stripe";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";

// checkout session
const checkoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { price, description } = req.body;
  const result = await subscriptionPlanService.checkoutSession(
    userId,
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


const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  if (!sig || !req.body) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing signature or raw body");
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret!
    );
  } catch (err: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  // Handle different Stripe events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.metadata?.subscriptionId;
      const userId = session.metadata?.userId;

      // await prisma.payment.create({
      //   data: {
      //     subscriptionId,
      //     userId,
      //     amount: session.amount_total! / 100,
      //     currency: session.currency!,
      //     status: "SUCCESS",
      //     provider: "STRIPE",
      //     paymentIntentId: session.payment_intent as string,
      //   },
      // });
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
