import express from "express";

import {
  getComments,
  createComment,
  likeComment,
  dislikeComment,
  reportComment,
  deleteComment,
} from "../controllers/commentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// COMMENTS
// ======================================================

router.get(
  "/:videoId",
  authMiddleware,
  getComments
);

router.post(
  "/",
  authMiddleware,
  createComment
);

router.post(
  "/:commentId/like",
  authMiddleware,
  likeComment
);

router.post(
  "/:commentId/dislike",
  authMiddleware,
  dislikeComment
);

router.post(
  "/:commentId/report",
  authMiddleware,
  reportComment
);

router.delete(
  "/:commentId",
  authMiddleware,
  deleteComment
);

export default router;