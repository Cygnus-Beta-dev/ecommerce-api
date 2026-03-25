import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenUtils.js";
import { getCookieOptions } from "../utils/cookieOptions.js";

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

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password -refreshToken -__v",
  );
  res.status(200).json({
    status: true,
    user,
  });
});
