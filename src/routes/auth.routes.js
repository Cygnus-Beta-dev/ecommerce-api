import express from "express";
const router = express.Router();
import * as authController from "../controllers/auth.controller.js";
import {
  registerValidation,
  loginValidation,
  validate,
} from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

router.get("/me", protect, authController.getCurrentUser);

export default router;