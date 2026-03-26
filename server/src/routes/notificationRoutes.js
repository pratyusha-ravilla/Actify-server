

//server/src/routes/NotificationRoutes.js

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  markAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.put("/:id/read", authMiddleware, markAsRead);

export default router;
