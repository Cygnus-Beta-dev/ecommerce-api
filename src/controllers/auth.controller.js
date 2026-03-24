import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const { password: _, __v, ...updateUser } = user.toObject();
    res.status(201).json({
      status: true,
      message: "User registered successfully!",
      user: updateUser,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});
