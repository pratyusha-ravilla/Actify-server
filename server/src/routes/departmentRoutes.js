import express from "express";
import Department from "../models/Department.js";

const router = express.Router();

// Public (Home page)
router.get("/public", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load departments" });
  }
});

export default router;
