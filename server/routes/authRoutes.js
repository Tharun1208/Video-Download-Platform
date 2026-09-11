import express from "express";
import {
  registerUser,
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
  updateTheme,
  getProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post(
  "/verify-login-otp",
  verifyLoginOtp
);

router.post(
  "/resend-login-otp",
  resendLoginOtp
);

router.put(
  "/theme",
  protect,
  updateTheme
);

router.get(
  "/profile",
  protect,
  getProfile
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.put(
  "/reset-password/:token",
  resetPassword
);

export default router;