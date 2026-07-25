import express from "express";

import {
  getDashboardStats,
  getAllUsers,
  getAllDownloads,
} from "../controllers/adminController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Dashboard Statistics
router.get("/dashboard", protect, adminOnly, getDashboardStats);

// Get All Users
router.get("/users", protect, adminOnly, getAllUsers);

// Get All Downloads
router.get("/downloads", protect, adminOnly, getAllDownloads);

export default router;