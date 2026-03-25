import express from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import categoriesRoutes from "./category.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/category", categoriesRoutes);

export default router;
