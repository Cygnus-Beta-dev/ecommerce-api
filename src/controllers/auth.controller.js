import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenUtils.js";
import { getCookieOptions } from "../utils/cookieOptions.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      status: false,
      message: "User already exists!",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone: phone || null,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();
  const { password: _, __v, refreshToken: __, ...updateUser } = user.toObject();

  res.status(201).json({
    status: true,
    message: "User registered successfully!",
    user: updateUser,
    accessToken,
    refreshToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    return res.status(401).json({
      status: false,
      message: "Invalid email or password",
    });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      status: false,
      message: "Invalid email or password",
    });
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, {
    ...getCookieOptions(),
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie("refreshToken", refreshToken, getCookieOptions());
  return res.status(200).json({
    status: true,
    message: "Login successful",
    accessToken,
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({
      status: false,
      message: "Refresh token required",
    });
  }
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    return res.status(403).json({
      status: false,
      message: "Invalid or expired refresh token",
    });
  }
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== incomingRefreshToken) {
    return res.status(403).json({
      status: false,
      message: "Refresh token mismatch",
    });
  }
  // 🔁 Rotate tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save();
  res.cookie("accessToken", newAccessToken, {
    ...getCookieOptions(),
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie("refreshToken", newRefreshToken, getCookieOptions());
  return res.status(200).json({
    status: true,
    message: "Token refreshed successfully",
    accessToken: newAccessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (incomingRefreshToken) {
    const user = await User.findOne({
      refreshToken: incomingRefreshToken,
    }).select("+refreshToken");
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.status(200).json({
    status: true,
    message: "Logged out successfully",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new AppError("Invalid or expired token", 400);

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({
    status: true,
    message: "Password reset successful",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError("User not found", 404);
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetUrl = `${req.protocol}://${req.get(
    "host",
  )}/api/auth/reset-password/${resetToken}`;

  await sendEmail({
    email: user.email,
    subject: "Password Reset",
    message: `<p>Reset password: <a href="${resetUrl}">${resetUrl}</a></p>`,
  });
  res.json({
    status: true,
    message: "Reset link sent to email",
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -refreshToken -__v",
  );
  res.status(200).json({
    status: true,
    user,
  });
});
