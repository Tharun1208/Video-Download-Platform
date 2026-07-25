import express from "express";

import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


// Get Profile
router.get(
  "/profile",
  authMiddleware,
  getUserProfile
);


// Update Profile
router.put(
  "/profile",
  authMiddleware,
  updateUserProfile
);


// Change Password
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);


export default router;