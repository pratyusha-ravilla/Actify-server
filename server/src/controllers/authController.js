

//server/src/controllers/authController.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =============================
       REGISTER USER (PUBLIC)
============================= */



// export const register = async (req, res) => {
//   try {
//     const { name, email, password, role = "faculty" } = req.body;

//     // 🔐 Step 1: Validate email format
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@atria\.edu$/;

//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         message: "Only Atria college emails are allowed (xxxx@atria.edu)",
//       });
//     }

//      // 🚨 Block creating Admin / HOD / Principal from public registration
//     if (role === "admin" || role === "hod" || role === "principal") {
//       return res.status(403).json({
//         message: "You are not allowed to create this account"
//       });
//     }

//     const existing = await User.findOne({ email });
//     if (existing)
//       return res.status(400).json({ message: "Email already registered" });

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await User.create({ name, email, password: hashed, role });

//     res.status(201).json({
//       message: "Registered successfully",
//       user: {
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Registration failed" });
//   }
// };



export const register = async (req, res) => {
  try {
    const { name, email, password, role = "faculty" } = req.body;

    // 🔐 Step 1: Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@atria\.edu\.in$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Only Atria college emails are allowed (xxxx@atria.edu.in)",
      });
    }

    // 🚨 Block creating Admin / HOD / Principal from public registration
    if (role === "admin" || role === "hod" || role === "principal") {
      return res.status(403).json({
        message: "You are not allowed to create this account",
      });
    }


    
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }

};



/* =============================
       LOGIN USER
============================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* =============================
       GET LOGGED-IN USER
============================= */
export const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch {
    res.status(500).json({ message: "Could not fetch user" });
  }
};

/* =============================
       ADMIN — GET USERS
============================= */
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

/* =============================
       ADMIN — ADD USER
============================= */
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role = "faculty" } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    res.json({ message: "User added successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Add user failed" });
  }
};

/* =============================
       ADMIN — UPDATE ROLE
============================= */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Optional: prevent removing last admin
    const admins = await User.countDocuments({ role: "admin" });
    const target = await User.findById(req.params.id);

    if (target.role === "admin" && admins === 1 && role !== "admin") {
      return res.status(400).json({ message: "Cannot remove last admin" });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update role failed" });
  }
};

/* =============================
       ADMIN — DELETE USER
============================= */
export const deleteUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);

    if (!target) return res.status(404).json({ message: "User not found" });

    // Prevent deleting last admin
    const admins = await User.countDocuments({ role: "admin" });
    if (target.role === "admin" && admins === 1) {
      return res.status(400).json({ message: "Cannot delete the last admin" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};



