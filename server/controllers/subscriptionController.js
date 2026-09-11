import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Razorpay from "razorpay";
import crypto from "crypto";

import { createNotification } from "./notificationController.js";
import { sendSubscriptionEmail } from "../utils/sendEmail.js";

// =========================================================
// RAZORPAY
// =========================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =========================================================
// PLAN PRICES
// =========================================================

const planPrices = {
  Bronze: 99,
  Silver: 199,
  Gold: 399,
};

// =========================================================
// CREATE RAZORPAY ORDER
// =========================================================

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    console.log("====================================");
    console.log("CREATE RAZORPAY ORDER");
    console.log("User:", req.user?._id);
    console.log("Plan:", plan);
    console.log("====================================");

    // =====================================================
    // VALIDATE PLAN
    // =====================================================

    if (!plan || !planPrices[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected.",
      });
    }

    // =====================================================
    // FIND USER
    // =====================================================

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =====================================================
    // CHECK EMAIL
    // =====================================================

    console.log("User name:", user.name);
    console.log("User email:", user.email);
    console.log("Current plan:", user.plan);

    // =====================================================
    // PREVENT BUYING SAME PLAN
    // =====================================================

    if (user.plan === plan) {
      return res.status(400).json({
        success: false,
        message: `You are already subscribed to the ${plan} plan.`,
      });
    }

    // =====================================================
    // GET PRICE
    // =====================================================

    const amount = planPrices[plan];

    console.log("Plan amount:", amount);

    // =====================================================
    // CREATE RAZORPAY ORDER
    // =====================================================

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    console.log(
      "✅ Razorpay order created:",
      order.id
    );

    // =====================================================
    // CREATE PENDING SUBSCRIPTION
    // =====================================================

    await Subscription.create({
      user: user._id,
      plan,
      amount,
      razorpayOrderId: order.id,
      paymentStatus: "Pending",
    });

    console.log(
      "✅ Pending subscription created"
    );

    // =====================================================
    // SEND RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        "Razorpay order created successfully.",
      order,
      plan,
      amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "❌ CREATE ORDER ERROR"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create Razorpay order.",
    });
  }
};

// =========================================================
// VERIFY RAZORPAY PAYMENT
// =========================================================

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    console.log("====================================");
    console.log("VERIFY RAZORPAY PAYMENT");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Signature:", razorpay_signature);
    console.log("Plan:", plan);
    console.log("User:", req.user?._id);
    console.log("====================================");

    // =====================================================
    // VALIDATE ORDER ID
    // =====================================================

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay order ID is missing.",
      });
    }

    // =====================================================
    // VALIDATE PAYMENT ID
    // =====================================================

    if (!razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay payment ID is missing.",
      });
    }

    // =====================================================
    // VALIDATE SIGNATURE
    // =====================================================

    if (!razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay signature is missing.",
      });
    }

    // =====================================================
    // VALIDATE PLAN
    // =====================================================

    if (!plan) {
      return res.status(400).json({
        success: false,
        message:
          "Subscription plan is missing.",
      });
    }

    // =====================================================
    // VALIDATE PLAN PRICE
    // =====================================================

    if (!planPrices[plan]) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid subscription plan.",
      });
    }

    // =====================================================
    // GET USER
    // =====================================================

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log("User found:", user._id);
    console.log("User name:", user.name);
    console.log("User email:", user.email);

    // =====================================================
    // GENERATE RAZORPAY SIGNATURE
    // =====================================================

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    console.log(
      "===================================="
    );

    console.log(
      "SIGNATURE VERIFICATION"
    );

    console.log(
      "Expected:",
      expectedSignature
    );

    console.log(
      "Received:",
      razorpay_signature
    );

    console.log(
      "===================================="
    );

    // =====================================================
    // VERIFY SIGNATURE
    // =====================================================

    if (
      expectedSignature !==
      razorpay_signature
    ) {
      console.error(
        "❌ Razorpay signature mismatch"
      );

      await Subscription.findOneAndUpdate(
        {
          user: user._id,
          razorpayOrderId:
            razorpay_order_id,
        },
        {
          paymentStatus: "Failed",

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,
        }
      );

      return res.status(400).json({
        success: false,
        message:
          "Payment verification failed.",
      });
    }

    console.log(
      "✅ Razorpay signature verified"
    );

    // =====================================================
    // UPDATE USER PLAN
    // =====================================================

    user.plan = plan;

    await user.save();

    console.log(
      `✅ User plan updated to: ${plan}`
    );

    // =====================================================
    // FIND PENDING SUBSCRIPTION
    // =====================================================

    let payment =
      await Subscription.findOne({
        user: user._id,
        razorpayOrderId:
          razorpay_order_id,
      });

    // =====================================================
    // UPDATE EXISTING PAYMENT
    // =====================================================

    if (payment) {
      payment.plan = plan;

      payment.amount =
        planPrices[plan];

      payment.razorpayPaymentId =
        razorpay_payment_id;

      payment.razorpaySignature =
        razorpay_signature;

      payment.paymentStatus =
        "Success";

      await payment.save();

      console.log(
        "✅ Existing subscription updated"
      );
    }

    // =====================================================
    // CREATE PAYMENT IF NOT FOUND
    // =====================================================

    else {
      payment =
        await Subscription.create({
          user: user._id,

          plan,

          amount:
            planPrices[plan],

          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,

          paymentStatus:
            "Success",
        });

      console.log(
        "✅ New successful subscription created"
      );
    }

    // =====================================================
    // CREATE NOTIFICATION
    // =====================================================

    try {
      await createNotification(
        user._id,
        "Subscription Activated",
        `${plan} plan activated successfully.`
      );

      console.log(
        "✅ Subscription notification created"
      );
    } catch (notificationError) {
      console.error(
        "❌ Notification error:",
        notificationError
      );
    }

    // =====================================================
    // SEND SUBSCRIPTION EMAIL
    // =====================================================

    try {
      console.log(
        "===================================="
      );

      console.log(
        "SENDING SUBSCRIPTION EMAIL"
      );

      console.log(
        "Email:",
        user.email
      );

      console.log(
        "Name:",
        user.name
      );

      console.log(
        "Plan:",
        plan
      );

      console.log(
        "Amount:",
        planPrices[plan]
      );

      console.log(
        "Order ID:",
        razorpay_order_id
      );

      console.log(
        "Payment ID:",
        razorpay_payment_id
      );

      console.log(
        "===================================="
      );

      // Check email before sending
      if (!user.email) {
        throw new Error(
          "User email is missing."
        );
      }

      await sendSubscriptionEmail({
        name:
          user.name || "User",

        email:
          user.email,

        plan:
          plan,

        amount:
          planPrices[plan],

        orderId:
          razorpay_order_id,

        paymentId:
          razorpay_payment_id,

        date:
          new Date().toLocaleString(
            "en-IN",
            {
              timeZone:
                "Asia/Kolkata",
            }
          ),
      });

      console.log(
        `✅ Subscription email sent to ${user.email}`
      );
    } catch (emailError) {
      console.error(
        "===================================="
      );

      console.error(
        "❌ SUBSCRIPTION EMAIL ERROR"
      );

      console.error(
        emailError
      );

      console.error(
        "===================================="
      );
    }

    // =====================================================
    // SUCCESS RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      message:
        "Subscription upgraded successfully.",

      plan:
        user.plan,

      amount:
        planPrices[plan],

      paymentId:
        razorpay_payment_id,

      orderId:
        razorpay_order_id,
    });
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "❌ VERIFY PAYMENT ERROR"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Payment verification failed.",
    });
  }
};

// =========================================================
// GET SUBSCRIPTION STATUS
// =========================================================

export const getSubscriptionStatus = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    return res.status(200).json({
      success: true,

      plan:
        user.plan,

      downloadsToday:
        user.downloadsToday,

      totalDownloads:
        user.totalDownloads,
    });
  } catch (error) {
    console.error(
      "Subscription status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// =========================================================
// GET PAYMENT HISTORY
// =========================================================

export const getPaymentHistory = async (
  req,
  res
) => {
  try {
    console.log(
      "Fetching payment history for:",
      req.user?._id
    );

    const payments =
      await Subscription.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count:
        payments.length,

      payments,
    });
  } catch (error) {
    console.error(
      "Payment history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};