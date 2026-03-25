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
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: false,
        message: "Forbidden: insufficient permissions",
      });
    }
    next();
  };
};
