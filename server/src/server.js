

//server/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

import eventRoutes from "./routes/eventRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import notificationRoutes from "./routes/notificationRoutes.js";

import "../src/jobs/eventRemainderJob.js";
import "../src/jobs/reportRemainderJob.js";

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---------- FIXED CORS CONFIGURATION (
//ALLOW CLIENT 5173) ----------


app.use(cors({
  origin: "http://localhost:5173",
  
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Serve uploads folder ----------

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------- Connect database ----------
connectDB();

// ---------- Routes ----------
import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";


import homeContentRoutes from "./routes/homeContentRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";

//contact
import contactRoutes from "./routes/contactRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/activity", activityRoutes);

//notification routes

app.use("/api/notifications", notificationRoutes);


//event registration
app.use("/api/events", eventRoutes);

app.use("/api/home-content", homeContentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/departments", departmentRoutes);

//contact
app.use("/api/contact", contactRoutes);



app.use("/api/admin", adminRoutes);

// ---------- Test Route ----------
app.get("/", (req, res) => {
  res.send("Server is running with CORS enabled");
});

// ---------- Start Server ----------

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// //trail 
// console.log("EMAIL USER:", process.env.EMAIL_USER);
// console.log("EMAIL PASS:", process.env.EMAIL_PASS);

