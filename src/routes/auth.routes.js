import express from "express";
const router = express.Router();
import {
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import {
  registerValidation,
  loginValidation,
  validate,
} from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

router.get("/me", authenticate, getCurrentUser);

export default router;
