import express from "express";
import {
  downloadVideo,
  getDownloadHistory,
  deleteDownload,
} from "../controllers/downloadController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Download a video
router.post("/:videoId", protect, downloadVideo);

// Get Download History
router.get("/history", protect, getDownloadHistory);

//Delete the video 
router.delete("/:downloadId", protect, deleteDownload);
export default router;