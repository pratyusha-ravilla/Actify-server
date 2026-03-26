export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
    console.log("USER ROLE:", req.user.role);
    console.log("ALLOWED:", allowedRoles);

  };
  
};
