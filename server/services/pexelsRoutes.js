import express from "express";
import { getPexelsVideos } from "../controllers/pexelsController.js";

const router = express.Router();

router.get("/:query", getPexelsVideos);

export default router;