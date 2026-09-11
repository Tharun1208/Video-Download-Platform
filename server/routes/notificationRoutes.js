import express from "express";

import {
    getNotifications,
    markAllNotificationsRead
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


router.get(
    "/",
    authMiddleware,
    getNotifications
);
router.patch(
    "/read-all",
    authMiddleware,
    markAllNotificationsRead
);

export default router;