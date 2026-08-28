import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/mark-all-read", protect, markAllNotificationsAsRead);
router.put("/:id/read", protect, markNotificationAsRead);

export default router;
