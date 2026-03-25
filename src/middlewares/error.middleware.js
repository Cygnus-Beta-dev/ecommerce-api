export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errorType = err.name || "Error";

  switch (errorType) {
    case "ValidationError":
      statusCode = 400;
      message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      break;

    case "CastError":
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
      break;

    case "JsonWebTokenError":
      statusCode = 401;
      message = "Invalid token. Please log in again.";
      break;

    case "TokenExpiredError":
      statusCode = 401;
      message = "Your token has expired. Please log in again.";
      break;

    default:
      if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `Duplicate ${field}. Please use another value.`;
      }
      break;
  }
  res.status(statusCode).json({
    status: statusCode >= 400 && statusCode < 500 ? "fail" : "error",
    message: message,
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
