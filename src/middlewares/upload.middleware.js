import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { __dirname } from "../utils/path.js";

// Only allow specific image mimetypes
function fileFilter(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false);
  }
  cb(null, true);
}

// Use memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter,
});

// Save image to disk after validation passes
export const saveImageToDisk = (fileBuffer, originalName) => {
  const uploadPath = path.join(__dirname, "..", "uploads", "products");
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  const fileExt = path.extname(originalName);
  const uniqueName = `${uuidv4()}${fileExt}`;
  const fullPath = path.join(uploadPath, uniqueName);
  fs.writeFileSync(fullPath, fileBuffer);
  return uniqueName;
};

// Delete image file from disk
export const deleteImageFromDisk = (imageUrl) => {
  if (!imageUrl) return;
  try {
    const fileName = imageUrl.split("/").pop();
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "products",
      fileName,
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Image delete error:", err.message);
  }
};
