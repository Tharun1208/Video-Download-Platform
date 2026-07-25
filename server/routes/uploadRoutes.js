import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import { uploadProfileImage } from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/profile",
  protect,
  upload.single("image"),
  uploadProfileImage
);

export default router;