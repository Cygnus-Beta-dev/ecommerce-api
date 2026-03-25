import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductRating,
  getProductsByCategory,
} from "../controllers/product.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  createProductValidation,
  updateProductValidation,
  addProductRatingValidation,
  getProductsValidation,
  validate,
  validateFileUpload,
} from "../middlewares/validate.middleware.js";

const router = express.Router();

router.get("/", getProductsValidation, validate, getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

router.use(authenticate);
router.post(
  "/",
  authorizeRoles("admin"),
  upload.array("images", 4),
  validateFileUpload,
  createProductValidation,
  validate,
  createProduct
);

router.put(
  "/:id",
  authorizeRoles("admin"),
  upload.array("images", 4),
  validateFileUpload,
  updateProductValidation,
  validate,
  updateProduct
);

router.delete(
  "/:id",
  authorizeRoles("admin"),
  validate,
  deleteProduct
);
router.post(
  "/:id/rating",
  addProductRatingValidation,
  validate,
  addProductRating
);

export default router;