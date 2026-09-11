import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER
    // =====================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // PLAN
    // =====================================================

    plan: {
      type: String,
      enum: [
        "Bronze",
        "Silver",
        "Gold",
      ],
      required: true,
    },

    // =====================================================
    // AMOUNT
    // =====================================================

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // =====================================================
    // RAZORPAY ORDER
    // =====================================================

    razorpayOrderId: {
      type: String,
      required: true,
    },

    // =====================================================
    // RAZORPAY PAYMENT
    // =====================================================

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "Created",
        "Paid",
        "Failed",
        "Cancelled",
      ],
      default: "Created",
    },

    // =====================================================
    // PAYMENT DATE
    // =====================================================

    paidAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // PAYMENT DESCRIPTION
    // =====================================================

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

export default Payment;