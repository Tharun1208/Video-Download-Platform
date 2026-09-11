import express from "express";

import {
  createRoom,
  getRoom,
} from "../controllers/roomController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Watch Party
router.post("/", authMiddleware, createRoom);

// Get Watch Party
router.get("/:roomCode", authMiddleware, getRoom);

export default router;