import { body, validationResult, param, query } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .bail()
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage("Only letters allowed"),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Min 6 chars")
    .matches(/[A-Z]/)
    .withMessage("One uppercase required")
    .matches(/[0-9]/)
    .withMessage("One number required"),
];

export const loginValidation = [
  body("email").trim().normalizeEmail().isEmail(),
  body("password").notEmpty(),
];

export const createProductValidation = [
  body("name").trim().notEmpty().isLength({ min: 3, max: 100 }),
  body("description").optional().trim().isLength({ max: 1000 }),
  body("price").notEmpty().isFloat({ min: 0 }).toFloat(),
  body("category").notEmpty().isMongoId(),
  body("stock").notEmpty().isInt({ min: 0 }).toInt(),
];

export const updateProductValidation = [
  param("id").isMongoId(),
  body("name").optional().trim().isLength({ min: 3 }),
  body("price").optional().isFloat({ min: 0 }).toFloat(),
  body("stock").optional().isInt({ min: 0 }).toInt(),
];

export const addProductRatingValidation = [
  param("id").isMongoId(),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating 1-5 only"),
  body("comment").optional().trim().isLength({ max: 500 }),
];

export const createCategoryValidation = [
  body("name").trim().notEmpty().isLength({ min: 2, max: 50 }),
  body("parentCategory").optional().isMongoId(),
];

export const getProductsValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().trim(),
  query("category").optional().isMongoId(),
  query("minPrice").optional().isFloat({ min: 0 }).toFloat(),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((value, { req }) => {
      if (req.query.minPrice && value < req.query.minPrice) {
        throw new Error("maxPrice must be greater");
      }
      return true;
    }),
  query("sort").optional().trim(),
];

export const validateFileUpload = (req, res, next) => {
  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({
      status: false,
      message: "At least one product image is required",
    });
  }
  next();
};

export const sanitizeQuery = (value) => {
  if (!value) return value;
  return value.replace(/[$]/g, "");
};

export const sanitizeHtml = (value) => {
  if (!value) return value;
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

export const slugify = (value) => {
  if (!value) return value;
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const formatted = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));
  return res.status(400).json({
    success: false,
    errors: formatted,
  });
};

export const mongoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (key.startsWith("$")) delete obj[key];
      if (typeof obj[key] === "object") sanitize(obj[key]);
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  next();
};
