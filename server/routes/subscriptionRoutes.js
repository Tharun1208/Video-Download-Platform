import express from "express";
import {
  upgradeToPremium,
  getSubscriptionStatus,
} from "../controllers/subscriptionController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/upgrade", protect, upgradeToPremium);
router.get("/status", protect, getSubscriptionStatus);

export default router;