import API from "./axios";

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

export const createOrder = (data) => {
  return API.post("/subscription/create-order", data);
};

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

export const verifyPayment = (paymentData) => {
  return API.post(
    "/subscription/verify-payment",
    paymentData
  );
};

// ==========================================
// GET SUBSCRIPTION STATUS
// ==========================================

export const getSubscriptionStatus = () => {
  return API.get("/subscription/status");
};

// ==========================================
// GET PAYMENT HISTORY
// ==========================================

export const getPaymentHistory = () => {
  return API.get("/subscription/payment-history");
};