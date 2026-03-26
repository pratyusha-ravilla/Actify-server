// server/src/routes/adminRoutes.js

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

import { getMyNotifications } from "../controllers/notificationController.js";
import { getAllEventsForAdmin } from "../controllers/adminEventController.js";

const router = express.Router();

/* =====================================================
   ADMIN + HOD + PRINCIPAL ROUTES
===================================================== */

// View all events created by faculty (for approval)
router.get(
  "/events",
  authMiddleware,
  roleMiddleware("admin", "hod", "principal"),
  getAllEventsForAdmin
);

// Notifications
router.get(
  "/notifications",
  authMiddleware,
  roleMiddleware("admin", "hod", "principal"),
  getMyNotifications
);

export default router;
