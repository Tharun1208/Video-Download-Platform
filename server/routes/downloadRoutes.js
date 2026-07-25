import express from "express";

import {
  downloadVideo,
  getDownloadHistory,
} from "../controllers/downloadController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Download a video
router.post("/:videoId", protect, downloadVideo);

// Get Download History
router.get("/history", protect, getDownloadHistory);

export default router;