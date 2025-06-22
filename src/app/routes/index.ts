import express from "express";

import { authRoutes } from "../modules/Auth/auth.routes";
import { subscriptionRoute } from "../modules/payment/payment.route";
import { userRoute } from "../modules/User/user.route";
import { productRoute } from "../modules/Products/product.route";
import { reviewRoute } from "../modules/Review/review.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/reviews",
    route: reviewRoute,
  },
  {
    path: "/subscription",
    route: subscriptionRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
