



// server/src/routes/activityRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Fix __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory -> server/src/uploads (one level above routes)
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  // filename: (req, file, cb) => {
  //   const clean = file.originalname.replace(/\s+/g, "_");
  //   cb(null, Date.now() + "-" + clean);
  // }


  filename: (req, file, cb) => {
  const cleanName = file.originalname
    .normalize("NFKD")              // fix unicode
    .replace(/[^\w.-]/g, "_")       // remove special chars
    .replace(/\s+/g, "_");          // remove spaces

  cb(null, Date.now() + "-" + cleanName);
}
});

const upload = multer({ storage });

const cpUpload = upload.fields([
  { name: "invitation", maxCount: 1 },
  { name: "poster", maxCount: 1 },
  { name: "resourcePhoto", maxCount: 1 },
  { name: "attendanceFile", maxCount: 1 },
  { name: "attendanceImages", maxCount: 20 },  
  { name: "photos", maxCount: 20 },
  { name: "feedbackImages", maxCount: 20 }

]);

// Controllers
import {
  createActivity,
  updateActivity,
  getActivity,
  getPdf,
  getDocx,
  listActivities,
  approveActivity,
  rejectActivity
} from "../controllers/activityController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import Activity from "../models/Activity.js";

const router = express.Router();

/* ============================================================
      FACULTY ROUTES
============================================================ */

// Create new report
router.post(
  "/",
  authMiddleware,
  roleMiddleware("faculty"),
  cpUpload,
  createActivity
);

// Update report
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty"),
  cpUpload,
  updateActivity
);

// Faculty → My Reports
router.get(
  "/mine",
  authMiddleware,
  roleMiddleware("faculty"),
  async (req, res) => {
    const list = await Activity.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  }
);
//new add-on

// GET reports by department
router.get("/department/:code", authMiddleware, async (req, res) => {
  try {
    const reports = await Activity.find({
      department: req.params.code
    }).sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});





/* ============================================================
      ADMIN / HOD / PRINCIPAL ROUTES
============================================================ */

// List all reports
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "hod", "principal"),
  listActivities
);

// Approve
router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("admin", "hod", "principal"),
  approveActivity
);

// Reject
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("admin", "hod", "principal"),
  rejectActivity
);

/* ============================================================
      SHARED ROUTES
============================================================ */

// Fetch single report
router.get("/:id", authMiddleware, getActivity);

//new update
router.put("/:id", authMiddleware, updateActivity);

// PDF download
router.get("/:id/pdf", authMiddleware, getPdf);

// DOCX download
router.get("/:id/docx", authMiddleware, getDocx);


export default router;
