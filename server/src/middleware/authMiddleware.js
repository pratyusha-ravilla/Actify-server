

//server/src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) return res.status(401).json({ message: "No token provided" });

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};
