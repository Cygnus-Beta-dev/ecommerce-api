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

const router = express.Router();

router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
router.use(authenticate);
router.post(
  "/",
  authorizeRoles("admin"),
  upload.array("images", 4),
  createProduct
);
router.put(
  "/:id",
  authorizeRoles("admin"),
  upload.array("images", 4),
  updateProduct
);
router.delete("/:id", authorizeRoles("admin"), deleteProduct);
router.post("/:id/rating", addProductRating);

export default router;