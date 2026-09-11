import express from "express";

import {
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
  getPaymentHistory,
} from "../controllers/subscriptionController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// =========================================================
// CREATE RAZORPAY ORDER
// =========================================================

router.post(
  "/create-order",
  protect,
  createOrder
);


// =========================================================
// VERIFY PAYMENT
// =========================================================

router.post(
  "/verify-payment",
  protect,
  verifyPayment
);


// =========================================================
// SUBSCRIPTION STATUS
// =========================================================

router.get(
  "/status",
  protect,
  getSubscriptionStatus
);


// =========================================================
// PAYMENT HISTORY
// =========================================================

router.get(
  "/payment-history",
  protect,
  getPaymentHistory
);


export default router;