import asyncHandler from "express-async-handler";
import { verifyAccessToken } from "../utils/tokenUtils.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Not authorized, no token",
    });
  }
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({
      status: false,
      message: "Not authorized, invalid token",
    });
  }
  req.user = decoded;
  next();
});

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied: insufficient role" });
    }
    next();
  };
};
