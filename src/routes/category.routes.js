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
import {
  createCategoryValidation,
  validate,
} from "../middlewares/validate.middleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.use(authenticate);
router.use(authorizeRoles("admin"));
router.post("/", createCategoryValidation, validate, createCategory);
router.put("/:id", validate, updateCategory);
router.delete("/:id", validate, deleteCategory);

export default router;
