import API from "./axios";

// =========================================================
// REGISTER
// =========================================================

export const registerUser = (userData) =>
  API.post(
    "/auth/register",
    userData
  );

// =========================================================
// LOGIN
// =========================================================

export const loginUser = (userData) =>
  API.post(
    "/auth/login",
    userData
  );

// =========================================================
// VERIFY LOGIN OTP
// =========================================================

export const verifyLoginOtp = (data) =>
  API.post(
    "/auth/verify-login-otp",
    data
  );

// =========================================================
// RESEND LOGIN OTP
// =========================================================

export const resendLoginOtp = (data) =>
  API.post(
    "/auth/resend-login-otp",
    data
  );

// =========================================================
// PROFILE
// =========================================================

export const getProfile = () =>
  API.get(
    "/users/profile"
  );