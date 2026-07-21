import express from "express";

import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// =======================
// Register User
// POST /api/auth/register
// =======================
router.post("/register", registerUser);


// =======================
// Login User
// POST /api/auth/login
// =======================
router.post("/login", loginUser);


// =======================
// Get User Profile (Protected)
// GET /api/auth/profile
// =======================
router.get("/profile", authMiddleware, (req, res) => {
  console.log("🔥 AUTH PROFILE ROUTE HIT");

  res.status(200).json({
    success: true,
    user: req.user,
  });
});


export default router;