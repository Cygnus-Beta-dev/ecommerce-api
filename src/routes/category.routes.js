import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.post("/", authorizeRoles("admin"), createCategory);
router.get("/", authorizeRoles("admin"), getAllCategories);
router.put("/:id", authorizeRoles("admin"), updateCategory);
router.delete("/:id", authorizeRoles("admin"), deleteCategory);

export default router;
