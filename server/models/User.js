import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },

    avatar: {
      type: String,
      default: "",
    },

    lastDownloadDate: {
      type: Date,
      default: null,
    },

    plan: {
      type: String,
      enum: ["Free", "Bronze", "Silver", "Gold"],
      default: "Free",
    },

    downloadsToday: {
      type: Number,
      default: 0,
    },

    totalDownloads: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },

    // ============================
    // THEME
    // ============================

    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "auto",
    },

    // ============================
    // LAST LOGIN INFORMATION
    // ============================

    lastLoginCity: {
      type: String,
      default: "",
    },

    lastLoginState: {
      type: String,
      default: "",
    },

    lastLoginDevice: {
      type: String,
      default: "",
    },

    // ============================
    // LOGIN OTP
    // ============================

    loginOtp: {
      type: String,
      default: null,
    },

    loginOtpExpire: {
      type: Date,
      default: null,
    },

    loginOtpVerified: {
      type: Boolean,
      default: false,
    },

    // ============================
    // PENDING LOGIN INFORMATION
    // ============================

    pendingLoginCity: {
      type: String,
      default: "",
    },

    pendingLoginState: {
      type: String,
      default: "",
    },

    pendingLoginDevice: {
      type: String,
      default: "",
    },

    pendingLoginTheme: {
      type: String,
      enum: ["light", "dark"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;