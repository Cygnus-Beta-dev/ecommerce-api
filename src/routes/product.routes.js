import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.post("/", upload.array("images", 4), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put(
  "/:id",
  authorizeRoles("admin"),
  upload.array("images", 4),
  updateProduct,
);
router.delete("/:id", authorizeRoles("admin"), deleteProduct);

export default router;
