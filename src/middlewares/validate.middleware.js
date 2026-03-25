import { body, validationResult, param, query } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("phone")
    .trim()
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be exactly 10 digits")
    .isNumeric()
    .withMessage("Phone number must contain only numbers"),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// ==================== Product Validations ====================

// Create Product Validation
export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters"),

  body("description")
    .trim()
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),

  body("stock")
    .notEmpty()
    .withMessage("Stock quantity is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be a positive integer"),

  body("images").optional().isArray().withMessage("Images must be an array"),
];

export const updateProductValidation = [
  param("id").isMongoId().withMessage("Invalid product ID format"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a positive integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

export const getProductByIdValidation = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
];

export const deleteProductValidation = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
];

export const addProductRatingValidation = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
];

export const getProductsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search term cannot be empty"),

  query("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number")
    .toFloat(),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.query.minPrice && value < parseFloat(req.query.minPrice)) {
        throw new Error("Maximum price must be greater than minimum price");
      }
      return true;
    }),

  query("minRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Minimum rating must be between 0 and 5")
    .toFloat(),

  query("inStock")
    .optional()
    .isBoolean()
    .withMessage("inStock must be true or false")
    .toBoolean(),

  query("sort")
    .optional()
    .trim()
    .matches(
      /^[a-zA-Z0-9_-]+(,[a-zA-Z0-9_-]+)*$|^-[a-zA-Z0-9_-]+(,-[a-zA-Z0-9_-]+)*$/,
    )
    .withMessage("Invalid sort format"),
];

export const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Category name can only contain letters, numbers, spaces, and hyphens",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("parentCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID format"),
];

export const updateCategoryValidation = [
  param("id").isMongoId().withMessage("Invalid category ID format"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Category name can only contain letters, numbers, spaces, and hyphens",
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

export const deleteCategoryValidation = [
  param("id").isMongoId().withMessage("Invalid category ID format"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = {};
  errors.array().forEach((err) => {
    extractedErrors[err.path] = err.msg;
  });
  return res.status(400).json({
    status: false,
    message: "Validation failed",
    errors: extractedErrors,
  });
};

export const validateFileUpload = (req, res, next) => {
  const files = req.files || [];
  const maxFiles = 4;
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const errors = {};

  if (files.length > maxFiles) {
    errors.images = `Maximum ${maxFiles} files allowed`;
  }
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!allowedTypes.includes(file.mimetype)) {
      errors[`image_${i}`] = `Invalid file type. Allowed: JPEG, PNG, WEBP`;
    }
    if (file.size > maxSize) {
      errors[`image_${i}`] = `File too large. Maximum size: 5MB`;
    }
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: false,
      message: "File validation failed",
      errors,
    });
  }
  next();
};
