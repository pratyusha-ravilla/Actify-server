

//server/src/routes/eventRoutes.js

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  getOpenEvents,
  registerForEvent,
  myRegistrations,
  myCreatedEvents,
  getEventById, // ✅ ADD THIS
} from "../controllers/eventController.js";

import { createEvent } from "../controllers/eventController.js";

import { deleteEvent } from "../controllers/eventController.js";

import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { approveEvent, rejectEvent } from "../controllers/eventController.js";

const router = express.Router();

router.get("/open", authMiddleware, getOpenEvents);
router.post("/:id/register", authMiddleware, registerForEvent);

router.get("/my-registrations", authMiddleware, myRegistrations);
router.post("/", authMiddleware, createEvent);

router.delete("/:id", authMiddleware, deleteEvent);

router.get("/test", (req, res) => {
  res.send("Events API working");
});

router.get("/ping", (req, res) => {
  res.send("Events API alive");
});

//approval events
router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("admin", "hod", "principal"),
  approveEvent,
);

router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("admin", "hod", "principal"),
  rejectEvent,
);

// routes
router.get("/mine", authMiddleware, myCreatedEvents);

// GET single event by ID (for report auto-fill)
router.get("/:id", authMiddleware, getEventById);

export default router;
