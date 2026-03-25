import asyncHandler from "express-async-handler";
import { Category } from "../models/index.js";
import { AppError } from "../middlewares/error.middleware.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory } = req.body;
  const category = await Category.create({
    name,
    description,
    parentCategory: parentCategory || null,
  });
  res.status(201).json({
    status: true,
    message: "Category created successfully",
    category,
  });
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).populate(
    "parentCategory",
    "name slug",
  );
  res.status(200).json({
    status: true,
    results: categories.length,
    categories,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  res.status(200).json({
    status: true,
    message: "Category updated successfully",
    category,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new AppError("Cannot delete category with existing products", 400);
  }
  await category.deleteOne();
  res.status(200).json({
    status: true,
    message: "Category deleted successfully",
  });
});
