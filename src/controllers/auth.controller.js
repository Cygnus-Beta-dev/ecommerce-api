import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenUtils.js";

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
  const {
    password: _,
    __v,
    refreshToken: __,
    ...updateUser
  } = user.toObject();

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
  const {
    password: _,
    __v,
    refreshToken: __,
  } = user.toObject();

  res.status(200).json({
    status: true,
    message: "Login successful",
    accessToken,
    refreshToken,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      status: false,
      message: "Refresh token is required",
    });
  }
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(403).json({
      status: false,
      message: "Invalid or expired refresh token",
    });
  }
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(403).json({
      status: false,
      message: "Invalid refresh token",
    });
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save();

  res.status(200).json({
    status: true,
    message: "Tokens refreshed successfully",
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const user = await User.findOne({ refreshToken }).select("+refreshToken");
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }
  res.status(200).json({
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
