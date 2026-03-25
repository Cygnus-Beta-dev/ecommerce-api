import asyncHandler from "express-async-handler";
import {
  saveImageToDisk,
  deleteImageFromDisk,
} from "../middlewares/upload.middleware.js";

import { Product } from "../models/index.js";

export const createProduct = asyncHandler(async (req, res) => {
  const images = files.map((file) => {
    const fileName = saveImageToDisk(file.buffer, file.originalname);
    return {
      fileName,
      url: `/uploads/products/${fileName}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });
});

export const getAllProducts = asyncHandler(async (req, res) => {
    /***
     * 
     * get all data with filter, seraching(with productname and description),sorting and pagination
     */
});

export const getProductById = asyncHandler(async (req, res) => {});

export const updateProduct = asyncHandler(async (req, res) => {
  if (files && files.length > 0) {
    for (const image of product.images) {
      deleteImageFromDisk(image.fileName);
    }
    await prisma.image.deleteMany({
      where: { productId: product.id },
    });
    const newImages = files.map((file) => {
      const fileName = saveImageToDisk(file.buffer, file.originalname);
      return {
        fileName,
        url: `/uploads/products/${fileName}`,
        mimetype: file.mimetype,
        size: file.size,
      };
    });
    updateData.images = {
      create: newImages,
    };
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
    for (const image of product.images) {
        deleteImageFromDisk(image.fileName);
    }
});
