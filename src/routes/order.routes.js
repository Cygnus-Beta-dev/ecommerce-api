import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
} from "../controllers/order.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
// Admin
router.get("/", authorizeRoles("admin"), getAllOrders);

export default router;
