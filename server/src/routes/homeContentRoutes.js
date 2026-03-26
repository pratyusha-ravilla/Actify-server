import express from "express";
import {
  getHomeContent,
  updateHomeContent,
} from "../controllers/homeContentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public
router.get("/", getHomeContent);

// Admin only
router.put(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  updateHomeContent
);

export default router;
