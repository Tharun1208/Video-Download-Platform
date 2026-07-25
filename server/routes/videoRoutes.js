import express from "express";
import {
  addVideo,
  getVideos,
  getVideoById,
  deleteVideo,
} from "../controllers/videoController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getVideos);
router.get("/:id", getVideoById);

// Admin Routes
router.post("/", protect, adminOnly, addVideo);
router.delete("/:id", protect, adminOnly, deleteVideo);

export default router;