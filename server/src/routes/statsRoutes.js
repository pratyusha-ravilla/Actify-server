import express from "express";
import Activity from "../models/Activity.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/department/:code", async (req, res) => {
  const code = req.params.code;

  try {
    const totalReports = await Activity.countDocuments({ department: code });
    const approved = await Activity.countDocuments({ department: code, status: "approved" });
    const pending = await Activity.countDocuments({ department: code, status: "pending" });
    const rejected = await Activity.countDocuments({ department: code, status: "rejected" });

    res.json({
      totalReports,
      approved,
      pending,
      rejected
    });
  } catch (err) {
    res.status(500).json({ message: "Stats failed" });
  }
});

export default router;
