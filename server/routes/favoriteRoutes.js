import express from "express";

import {
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from "../controllers/favoriteController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Add to Favorites
router.post("/:videoId", protect, addToFavorites);

// Get My Favorites
router.get("/", protect, getFavorites);

// Remove from Favorites
router.delete("/:videoId", protect, removeFromFavorites);

export default router;