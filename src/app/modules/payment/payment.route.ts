import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { stripeController } from "./payment.controller";

const router = express.Router();

// checkout session
router.post(
  "/checkout",
  auth(UserRole.USER),
  stripeController.checkoutSession
);


router.post(
  "/webhooks",
  express.raw({ type: "application/json" }), // important: keep raw body
  stripeController.handleStripeWebhook
);

export const subscriptionRoute = router;
// cloudflared tunnel --url http://localhost:5000