import asyncHandler from "express-async-handler";
import { Product, Category } from "../models/index.js";
import {
  saveImageToDisk,
  deleteMultipleImages,
} from "../middlewares/upload.middleware.js";
import { AppError } from "../middlewares/error.middleware.js";

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const files = req.files || [];

  if (!files || files.length === 0) {
    throw new AppError("At least one product image is required", 400);
  }
  const existingProduct = await Product.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    category,
  });
  if (existingProduct) {
    throw new AppError("Product already exists in this category", 400);
  }
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError("Category not found", 404);
  }
  const images = files.map((file) => {
    const fileName = saveImageToDisk(file.buffer, file.originalname);
    return {
      fileName,
      url: `/uploads/products/${fileName}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });
  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    images,
    createdBy: req.user.id,
  });
  await product.populate("category", "name slug");
  res.status(201).json({
    status: true,
    message: "Product created successfully",
    product,
  });
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    search,
    category,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    isActive,
  } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === true || isActive === "true";
  }

  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (category) filter.category = category;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = minPrice;
    if (maxPrice) filter.price.$lte = maxPrice;
  }

  if (minRating) filter.averageRating = { $gte: minRating };

  if (inStock === true || inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  const skip = (page - 1) * limit;

  const sortBy = sort
    ? Object.fromEntries(
        sort
          .split(",")
          .map((field) =>
            field.startsWith("-") ? [field.substring(1), -1] : [field, 1],
          ),
      )
    : { createdAt: -1 };

  const products = await Product.find(filter)
    .populate("category", "name slug")
    .populate("createdBy", "name email")
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);
  res.status(200).json({
    status: true,
    results: products.length,
    data: products,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id)
    .populate("category", "name slug description")
    .populate("createdBy", "name email")
    .populate("ratings.user", "name email");

  if (!product) {
    throw new AppError("Product not found", 404);
  }
  res.status(200).json({
    status: true,
    product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const files = req.files || [];
  const updateData = { ...req.body };

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  if (updateData.category) {
    const categoryExists = await Category.findById(updateData.category);
    if (!categoryExists) {
      throw new AppError("Category not found", 404);
    }
  }
  if (files && files.length > 0) {
    if (product.images && product.images.length > 0) {
      deleteMultipleImages(product.images);
    }
    const newImages = files.map((file) => {
      const fileName = saveImageToDisk(file.buffer, file.originalname);
      return {
        fileName,
        url: `/uploads/products/${fileName}`,
        mimetype: file.mimetype,
        size: file.size,
      };
    });
    updateData.images = newImages;
  }
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("category", "name slug");
  res.status(200).json({
    status: true,
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  if (product.images && product.images.length > 0) {
    deleteMultipleImages(product.images);
  }
  await product.deleteOne();
  res.status(200).json({
    status: true,
    message: "Product deleted successfully",
  });
});

export const addProductRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const existingRating = product.ratings.find(
    (r) => r.user.toString() === userId,
  );

  if (existingRating) {
    existingRating.rating = rating;
    existingRating.comment = comment;
  } else {
    product.ratings.push({
      user: userId,
      rating,
      comment,
      createdAt: new Date(),
    });
  }

  // Calculate average rating
  const totalRating = product.ratings.reduce((sum, r) => sum + r.rating, 0);
  product.averageRating = totalRating / product.ratings.length;
  product.numOfReviews = product.ratings.length;

  await product.save();

  res.status(200).json({
    status: true,
    message: "Rating added successfully",
    averageRating: product.averageRating,
    numOfReviews: product.numOfReviews,
  });
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const products = await Product.find({ category: categoryId, isActive: true })
    .populate("category", "name slug")
    .skip(skip)
    .limit(limitNum);

  const total = await Product.countDocuments({
    category: categoryId,
    isActive: true,
  });
  res.status(200).json({
    status: true,
    results: products.length,
    data: products,
    category,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
    },
  });
});
