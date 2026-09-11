import mongoose from "mongoose";

const loginOtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    device: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LoginOtp = mongoose.model("LoginOtp", loginOtpSchema);

export default LoginOtp;