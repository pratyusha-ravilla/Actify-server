
// server/src/routes/authRoutes.js
import express from "express";
import { 
  register, 
  login, 
  getMe, 
  getAllUsers, 
  addUser, 
  updateUserRole, 
  deleteUser
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* =============================
       PUBLIC ROUTES
============================= */
router.post("/register", register);
router.post("/login", login);

/* =============================
     AUTH USER DETAILS
============================= */
router.get("/me", authMiddleware, getMe);

/* =============================
     ADMIN ONLY — USER MGMT
============================= */

// Get all users
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUsers
);

// Add user (Admin creates faculty/admin accounts)
router.post(
  "/users/add",
  authMiddleware,
  roleMiddleware("admin"),
  addUser
);

// Update user role (promote/demote)
router.put(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware("admin"),
  updateUserRole
);

// Delete a user
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

export default router;
